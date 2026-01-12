const teamLeadService = require('../services/teamLeadService');

class TeamLeadController {
  async getMyAssignments(req, res) {
    try {
      const assignments = await teamLeadService.getMyAssignments(req.user.id);

      return res.status(200).json({
        count: assignments.length,
        assignments
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status, reviewNotes } = req.body;

      if (!status) {
        return res.status(400).json({
          message: 'status is required'
        });
      }

      const updatedAssignment =
        await teamLeadService.updateAssignmentStatus(
          req.assignment,
          status,
          req.user.id,
          reviewNotes || null
        );

      return res.status(200).json({
        message: 'Assignment status updated',
        assignment: updatedAssignment
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
}

module.exports = new TeamLeadController();
