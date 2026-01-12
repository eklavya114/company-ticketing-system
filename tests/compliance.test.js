const dbHandler = require('./setup');
const complianceService = require('../services/compilenceService');
const DepartmentAssignment = require('../model/ComplianceModel');
const AuditLog = require('../model/AuditLog');

describe('Compliance Service', () => {
    beforeAll(async () => await dbHandler.connect());
    afterEach(async () => await dbHandler.clearDatabase());
    afterAll(async () => await dbHandler.closeDatabase());

    describe('approveTicket', () => {
        it('should create department assignments on approval', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({
                role: 'SUPER_ADMIN',
                department: 'Compliance'
            });
            const ticket = await dbHandler.createTestTicket(client._id);

            const departments = [
                { name: 'Resume', branch: null },
                { name: 'Technical', branch: null }
            ];

            await complianceService.approveTicket(
                ticket._id,
                departments,
                compliance._id,
                'Valid request, assigning to relevant departments'
            );

            const assignments = await DepartmentAssignment.find({ ticket_id: ticket._id });
            expect(assignments.length).toBe(2);
            expect(assignments.map(a => a.department)).toContain('Resume');
            expect(assignments.map(a => a.department)).toContain('Technical');
        });

        it('should change ticket status to In Resolution', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({ role: 'SUPER_ADMIN' });
            const ticket = await dbHandler.createTestTicket(client._id);

            await complianceService.approveTicket(
                ticket._id,
                [{ name: 'Sales', branch: null }],
                compliance._id
            );

            const Ticket = require('../model/ticketmodel');
            const updatedTicket = await Ticket.findById(ticket._id);
            expect(updatedTicket.status).toBe('In Resolution');
        });

        it('should create audit log entries', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({ role: 'SUPER_ADMIN' });
            const ticket = await dbHandler.createTestTicket(client._id);

            await complianceService.approveTicket(
                ticket._id,
                [{ name: 'Marketing', branch: 'AHM' }],
                compliance._id,
                'Marketing team analysis needed'
            );

            const auditLogs = await AuditLog.find({ ticket_id: ticket._id });
            const eventTypes = auditLogs.map(l => l.event_type);

            expect(eventTypes).toContain('TICKET_APPROVED');
            expect(eventTypes).toContain('DEPARTMENTS_ASSIGNED');
        });

        it('should not approve twice', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({ role: 'SUPER_ADMIN' });
            const ticket = await dbHandler.createTestTicket(client._id);

            await complianceService.approveTicket(
                ticket._id,
                [{ name: 'Resume', branch: null }],
                compliance._id
            );

            await expect(
                complianceService.approveTicket(
                    ticket._id,
                    [{ name: 'Technical', branch: null }],
                    compliance._id
                )
            ).rejects.toThrow('Departments already assigned');
        });
    });

    describe('closeTicket', () => {
        it('should close a Ready to Close ticket', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({ role: 'SUPER_ADMIN' });
            const ticket = await dbHandler.createTestTicket(client._id, {
                status: 'Ready to Close'
            });

            const closedTicket = await complianceService.closeTicket(
                ticket._id,
                compliance._id
            );

            expect(closedTicket.status).toBe('Closed');
            expect(closedTicket.closedAt).toBeDefined();
        });

        it('should not close if not Ready to Close', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({ role: 'SUPER_ADMIN' });
            const ticket = await dbHandler.createTestTicket(client._id, {
                status: 'In Resolution'
            });

            await expect(
                complianceService.closeTicket(ticket._id, compliance._id)
            ).rejects.toThrow('Ticket is not ready to close');
        });

        it('should not close if unresolved assignments exist', async () => {
            const client = await dbHandler.createTestUser({ role: 'CLIENT' });
            const compliance = await dbHandler.createTestUser({ role: 'SUPER_ADMIN' });
            const ticket = await dbHandler.createTestTicket(client._id, {
                status: 'Ready to Close'
            });

            // Create an unresolved assignment
            await DepartmentAssignment.create({
                ticket_id: ticket._id,
                department: 'Resume',
                status: 'In Progress'
            });

            await expect(
                complianceService.closeTicket(ticket._id, compliance._id)
            ).rejects.toThrow('All department assignments are not resolved');
        });
    });
});
