const assignmentRepo = require('../repository/departmentAssignmentRepository');
const User = require('../model/usermodel');
const auditService = require('./auditService');

class DepartmentAssignmentService {
  async assignTeamLead(assignmentId, teamLeadId, managerUser) {
    const assignment = await assignmentRepo.findById(assignmentId);

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Verify team lead exists
    const teamLead = await User.findById(teamLeadId);
    if (!teamLead || teamLead.role !== 'USER') {
      throw new Error('Invalid team lead');
    }

    // Department match
    if (teamLead.department !== assignment.department) {
      throw new Error('Team lead belongs to a different department');
    }

    // Marketing branch match
    if (
      assignment.department === 'Marketing' &&
      teamLead.branch !== assignment.branch
    ) {
      throw new Error('Team lead belongs to a different marketing branch');
    }

    const updatedAssignment = await assignmentRepo.assignTeamLead(
      assignmentId,
      teamLeadId
    );

    // 📝 AUDIT: Log team lead assignment
    await auditService.logTeamLeadAssigned(assignment, teamLeadId, managerUser.id);

    return updatedAssignment;
  }

  async getManagerAssignments(managerUser) {
    return assignmentRepo.getAssignmentsByDepartment(
      managerUser.department,
      managerUser.department === 'Marketing'
        ? managerUser.branch
        : null
    );
  }
}

module.exports = new DepartmentAssignmentService();

