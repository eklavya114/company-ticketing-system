const complianceService = require('../services/compilenceService');

class ComplianceController {
  /**
   * GET /compliance/queue
   * View tickets waiting for compliance review
   */
  async getComplianceQueue(req, res) {
    try {
      const tickets = await complianceService.getComplianceQueue();

      return res.status(200).json({
        count: tickets.length,
        tickets
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message
      });
    }
  }

  /**
   * GET /compliance/ready-to-close
   * View tickets pending final closure with reviews
   */
  async getReadyToCloseQueue(req, res) {
    try {
      const tickets = await complianceService.getReadyToCloseQueue();

      return res.status(200).json({
        count: tickets.length,
        tickets
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message
      });
    }
  }

  /**
   * POST /compliance/tickets/:ticketId/approve
   * Approve ticket & assign departments
   */
  async approveTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const { departments, decisionReason } = req.body;

      if (!departments || !Array.isArray(departments) || departments.length === 0) {
        return res.status(400).json({
          message: 'At least one department must be assigned'
        });
      }

      const result = await complianceService.approveTicket(
        ticketId,
        departments,
        req.user.id,
        decisionReason || null
      );

      return res.status(200).json({
        message: 'Ticket approved and departments assigned',
        ticket_id: result.ticketId
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message
      });
    }
  }

  async closeTicket(req, res) {
    try {
      const { ticketId } = req.params;

      const ticket = await complianceService.closeTicket(ticketId, req.user.id);

      return res.status(200).json({
        message: 'Ticket closed successfully',
        ticket
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message
      });
    }
  }
}

module.exports = new ComplianceController();
