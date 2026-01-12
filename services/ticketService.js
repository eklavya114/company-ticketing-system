const { v4: uuidv4 } = require('uuid');
const ticketRepository = require('../repository/ticketRepository');
const DepartmentAssignment = require('../model/ComplianceModel');

class TicketService {
  /**
   * Create a NEW ticket (CLIENT)
   */
  async createTicket(data, clientId) {
    const ticket = await ticketRepository.create({
      referenceID: uuidv4(),
      parent_ticket_id: null,

      clientID: clientId,

      title: data.title,
      description: data.description,
      priority: data.priority,

      reopen_count: 0,
      warning_flag: false,

      contact_email: data.contact_email,
      contact_phone: data.contact_phone,

      status: 'In Compliance Review'
    });

    return ticket;
  }

  /**
   * Reopen a CLOSED ticket (creates sister ticket)
   */
  async reopenTicket(ticketId, clientId) {
    const oldTicket = await ticketRepository.findById(ticketId);
    console.log('Old Ticket fetched for reopening:', oldTicket);
    if (!oldTicket) {
      throw new Error('Ticket not found');
    }
  
    if (oldTicket.clientID.toString() !== clientId.toString()) {
      throw new Error('Unauthorized');
    }
    const reopenticketStatus= await ticketRepository.findByReferenceId(oldTicket.referenceID);
    
const hasOpenTicket = reopenticketStatus.some(
  ticket => ticket.status !== 'Closed'
);

    console.log('Tickets with same reference ID:', reopenticketStatus   );
    if (oldTicket.status !== 'Closed' ) {
      throw new Error('Only closed tickets can be reopened');
    }

    if(hasOpenTicket)   {
        console.log('There is an open ticket in this reference group:', reopenticketStatus);
      throw new Error('There is already an open ticket in this reference group');
    }
    // Count tickets in this reference group
    const totalTickets = await ticketRepository.countByReferenceId(
      oldTicket.referenceID
    );
    console.log('Total tickets with reference ID', oldTicket.referenceID, ':', totalTickets);

    const reopenCount = totalTickets - 1; // original ticket not counted as reopen
    const newReopenCount = reopenCount + 1;

    const sisterTicket = await ticketRepository.create({
      referenceID: oldTicket.referenceID,
      parent_ticket_id: oldTicket._id.toString(),

      clientID: oldTicket.clientID,

      title: oldTicket.title,
      description: oldTicket.description,
      priority: oldTicket.priority,

      reopenCount: newReopenCount,
      warningFlag: newReopenCount > 0,

      contact_email: oldTicket.contact_email,
      contact_phone: oldTicket.contact_phone,

      status: 'In Compliance Review'
    });

    return sisterTicket;
  }

  /**
   * Get full history of an issue (by reference_id)
   */
  async getTicketHistory(referenceId) {
    return ticketRepository.findByReferenceId(referenceId);
  }

  /**
   * Get all tickets for a client
   */
  async getClientTickets(clientId) {
    return ticketRepository.findByClientId(clientId);
  }

  /**
   * Get ticket by ID with assignments
   */
  async getTicketById(ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    const assignments = await DepartmentAssignment.find({ ticket_id: ticketId });
    return { ticket, assignments };
  }
}

module.exports = new TicketService();
