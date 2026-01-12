const DepartmentAssignment = require('../model/ComplianceModel');
const Ticket = require('../model/ticketmodel');
const auditService = require('./auditService');

class TeamLeadService {
  async getMyAssignments(teamLeadId) {
    return DepartmentAssignment.find({
      assigned_team_lead_id: teamLeadId
    }).sort({ createdAt: 1 });
  }

  async updateAssignmentStatus(assignment, newStatus, teamLeadId, reviewNotes = null) {
    const allowedStatuses = [
      'In Progress',
      'Waiting for Client',
      'Resolved'
    ];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error('Invalid status update');
    }

    const oldStatus = assignment.status;
    assignment.status = newStatus;

    if (newStatus === 'Resolved') {
      assignment.resolved_at = new Date();
      // Save review notes when resolving
      if (reviewNotes) {
        assignment.review_notes = reviewNotes;
      }
    }

    await assignment.save();

    // 📝 AUDIT: Log status update
    await auditService.logAssignmentStatusUpdated(assignment, newStatus, oldStatus, teamLeadId);

    // 🔥 AUTO SYNC TICKET STATUS
    const ticket = await Ticket.findById(assignment.ticket_id);

    if (newStatus === 'Waiting for Client' && ticket.status !== 'Waiting for Client') {
      // If any assignment is waiting, ticket should reflect that
      ticket.status = 'Waiting for Client';
      await ticket.save();
    } else if (newStatus === 'In Progress' && ticket.status === 'Waiting for Client') {
      // Resume to In Resolution when work continues
      ticket.status = 'In Resolution';
      await ticket.save();
    }

    // Check if all resolved
    const unresolvedCount = await DepartmentAssignment.countDocuments({
      ticket_id: assignment.ticket_id,
      status: { $ne: 'Resolved' }
    });

    if (unresolvedCount === 0) {
      await Ticket.findByIdAndUpdate(
        assignment.ticket_id,
        { status: 'Ready to Close' }
      );
    }

    return assignment;
  }
}

module.exports = new TeamLeadService();

