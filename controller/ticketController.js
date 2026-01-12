const ticketService = require('../services/ticketService');

class TicketController {
  /**
   * POST /tickets
   * Client creates a ticket
   */
  async createTicket(req, res) {
    try {
        console.log('Request Body:', req.user.id, req.body);
      const ticket = await ticketService.createTicket(
        req.body,
         req.user.id
      );

      return res.status(201).json({
        message: 'Ticket created successfully',
        ticket_id: ticket._id,
        reference_id: ticket.referenceID,
        clientID: ticket.clientID,
        status: ticket.status
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  }

  /**
   * POST /tickets/:ticketId/reopen
   * Client reopens a closed ticket
   */
  async reopenTicket(req, res) {
    try {
      const { ticketId } = req.params;
      
        console.log('Reopen Ticket Request by User:', req.user.id, 'for Ticket ID:', ticketId);
      const ticket = await ticketService.reopenTicket(
        ticketId,
        req.user.id
      );

      return res.status(201).json({
        message: 'Ticket reopened successfully',
        ticket_id: ticket._id,
        reference_id: ticket.referenceID,
        warning_flag: ticket.warningFlag
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  }

  /**
   * GET /tickets/history/:referenceId
   */
  async getTicketHistory(req, res) {
    try {
      const { referenceId } = req.params;

      const tickets = await ticketService.getTicketHistory(referenceId);

      return res.status(200).json({
        reference_id: referenceId,
        history: tickets
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  }

  /**
   * GET /tickets/my-tickets
   * Get all tickets for the current client
   */
  async getMyTickets(req, res) {
    try {
      const tickets = await ticketService.getClientTickets(req.user.id);

      return res.status(200).json({
        count: tickets.length,
        tickets
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  }

  /**
   * GET /tickets/:ticketId
   * Get a single ticket by ID with assignments
   */
  async getTicketById(req, res) {
    try {
      const { ticketId } = req.params;
      const result = await ticketService.getTicketById(ticketId);

      return res.status(200).json({
        ticket: result.ticket,
        assignments: result.assignments
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  }
}

module.exports = new TicketController();
