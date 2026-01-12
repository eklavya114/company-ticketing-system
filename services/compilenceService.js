const complianceRepo = require('../repository/compilenceRepository');
const Ticket = require('../model/ticketmodel');
const DepartmentAssignment = require('../model/ComplianceModel');
const auditService = require('./auditService');

class ComplianceService {
  /**
   * Approve ticket and assign to departments
   * @param {string} ticketId 
   * @param {Array} departments - [{name: 'Resume', branch: null}, ...]
   * @param {string} complianceUserId 
   * @param {string} decisionReason - Optional reason for approval
   */
  async approveTicket(ticketId, departments, complianceUserId, decisionReason = null) {
    const ticket = await complianceRepo.findTicketById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'In Compliance Review') {
      throw new Error('Ticket is not in compliance review');
    }

    // Prevent double approval
    const alreadyAssigned = await complianceRepo.hasAssignments(ticketId);
    if (alreadyAssigned) {
      throw new Error('Departments already assigned for this ticket');
    }
    console.log("departments", departments);

    const assignments = departments.map(dep => ({
      ticket_id: ticket._id,
      department: dep.name,
      branch: dep.name === 'Marketing' ? dep.branch : null,
      assigned_manager_id: null,
      assigned_team_lead_id: null,
      status: 'Not Assigned'
    }));
    console.log("assignments", assignments);
    await complianceRepo.createDepartmentAssignments(assignments);

    await complianceRepo.updateTicketStatus(ticket._id, 'In Resolution');

    // 📝 AUDIT: Log ticket approval
    await auditService.logTicketApproved(
      ticket._id,
      ticket.referenceID,
      departments,
      complianceUserId,
      decisionReason
    );

    // 📝 AUDIT: Log department assignments
    await auditService.logDepartmentsAssigned(
      ticket._id,
      ticket.referenceID,
      departments,
      complianceUserId
    );

    return { ticketId: ticket._id };
  }

  async getComplianceQueue() {
    return complianceRepo.getComplianceQueue();
  }

  /**
   * Get tickets ready for final closure (all departments resolved)
   */
  async getReadyToCloseQueue() {
    const tickets = await Ticket.find({ status: 'Ready to Close' })
      .sort({ updatedAt: -1 })
      .lean();

    // Enrich with department assignment details and reviews
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const assignments = await DepartmentAssignment.find({ ticket_id: ticket._id })
          .populate('assigned_team_lead_id', 'name email')
          .lean();

        return {
          ...ticket,
          assignments: assignments.map(a => ({
            department: a.department,
            branch: a.branch,
            teamLead: a.assigned_team_lead_id,
            status: a.status,
            review_notes: a.review_notes,
            resolved_at: a.resolved_at
          }))
        };
      })
    );

    return enrichedTickets;
  }

  /**
   * Close a ticket after all departments resolved
   */
  async closeTicket(ticketId, complianceUserId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // 🔒 Must be ready to close
    if (ticket.status !== 'Ready to Close') {
      throw new Error('Ticket is not ready to close');
    }

    // 🔍 Safety check (extra protection)
    const unresolvedCount = await DepartmentAssignment.countDocuments({
      ticket_id: ticket._id,
      status: { $ne: 'Resolved' }
    });

    if (unresolvedCount > 0) {
      throw new Error('All department assignments are not resolved');
    }

    // ✅ Final closure
    ticket.status = 'Closed';
    ticket.closedAt = new Date();

    await ticket.save();

    // 📝 AUDIT: Log ticket closure
    await auditService.logTicketClosed(ticket, complianceUserId);

    return ticket;
  }
}

module.exports = new ComplianceService();

