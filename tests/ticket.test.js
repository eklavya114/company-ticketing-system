const dbHandler = require('./setup');
const ticketService = require('../services/ticketService');
const Ticket = require('../model/ticketmodel');
const AuditLog = require('../model/AuditLog');

describe('Ticket Service', () => {
    beforeAll(async () => await dbHandler.connect());
    afterEach(async () => await dbHandler.clearDatabase());
    afterAll(async () => await dbHandler.closeDatabase());

    describe('createTicket', () => {
        it('should create a ticket with correct initial status', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });

            const ticketData = {
                title: 'New Issue',
                description: 'Something is broken',
                priority: 'High',
                contact_email: 'client@test.com',
                contact_phone: '+1111111111'
            };

            const ticket = await ticketService.createTicket(ticketData, client._id);

            expect(ticket).toBeDefined();
            expect(ticket.status).toBe('In Compliance Review');
            expect(ticket.referenceID).toBeDefined();
            expect(ticket.clientID.toString()).toBe(client._id.toString());
        });

        it('should create an audit log entry on ticket creation', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });

            const ticketData = {
                title: 'Audited Ticket',
                description: 'Check audit log',
                priority: 'Low',
                contact_email: 'audit@test.com',
                contact_phone: '+2222222222'
            };

            const ticket = await ticketService.createTicket(ticketData, client._id);

            const auditLogs = await AuditLog.find({ ticket_id: ticket._id });
            expect(auditLogs.length).toBeGreaterThan(0);
            expect(auditLogs[0].event_type).toBe('TICKET_CREATED');
        });
    });

    describe('reopenTicket', () => {
        it('should create a sister ticket when reopening', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const originalTicket = await dbHandler.createTestTicket(client._id, {
                status: 'Closed'
            });

            const sisterTicket = await ticketService.reopenTicket(
                originalTicket._id,
                client._id
            );

            expect(sisterTicket).toBeDefined();
            expect(sisterTicket.referenceID).toBe(originalTicket.referenceID);
            expect(sisterTicket.parent_ticket_id.toString()).toBe(originalTicket._id.toString());
            expect(sisterTicket.status).toBe('In Compliance Review');
        });

        it('should set warning flag on second reopen', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const originalTicket = await dbHandler.createTestTicket(client._id, {
                status: 'Closed'
            });

            // First reopen
            const sister1 = await ticketService.reopenTicket(originalTicket._id, client._id);

            // Close the sister ticket
            sister1.status = 'Closed';
            await sister1.save();

            // Second reopen
            const sister2 = await ticketService.reopenTicket(sister1._id, client._id);

            expect(sister2.reopenCount).toBe(2);
            expect(sister2.warningFlag).toBe(true);
        });

        it('should not reopen a non-closed ticket', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const ticket = await dbHandler.createTestTicket(client._id, {
                status: 'In Resolution'
            });

            await expect(
                ticketService.reopenTicket(ticket._id, client._id)
            ).rejects.toThrow('Only closed tickets can be reopened');
        });

        it('should not reopen if another ticket in group is open', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const ticket1 = await dbHandler.createTestTicket(client._id, {
                status: 'Closed'
            });

            // Create a sister (still open)
            await ticketService.reopenTicket(ticket1._id, client._id);

            // Try to reopen original again (should fail because sister is open)
            await expect(
                ticketService.reopenTicket(ticket1._id, client._id)
            ).rejects.toThrow('There is already an open ticket in this reference group');
        });
    });

    describe('getTicketHistory', () => {
        it('should return all tickets with same referenceID', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const ticket1 = await dbHandler.createTestTicket(client._id, {
                status: 'Closed'
            });

            const sister = await ticketService.reopenTicket(ticket1._id, client._id);

            const history = await ticketService.getTicketHistory(ticket1.referenceID);

            expect(history.length).toBe(2);
            expect(history.map(t => t._id.toString())).toContain(ticket1._id.toString());
            expect(history.map(t => t._id.toString())).toContain(sister._id.toString());
        });
    });
});
