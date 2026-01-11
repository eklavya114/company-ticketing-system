/**
 * RBAC Middleware for CTS
 * ----------------------
 * Handles role, ownership, department, and branch checks
 */

/**
 * CLIENT ONLY
 * Client can access only client-specific routes
 */
const clientOnly = (req, res, next) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({
      message: 'Access denied: Client only'
    });
  }
  next();
};

/**
 * COMPLIANCE ONLY (SUPER_ADMIN)
 */
const complianceOnly = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      message: 'Access denied: Compliance only'
    });
  }
  next();
};

/**
 * MANAGER ONLY (ADMIN)
 * Department must exist
 */
const managerOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied: Manager only'
    });
  }

  if (!req.user.department) {
    return res.status(403).json({
      message: 'Department missing for manager'
    });
  }

  next();
};

/**
 * TEAM LEAD ONLY (USER)
 */
const teamLeadOnly = (req, res, next) => {
  if (req.user.role !== 'USER') {
    return res.status(403).json({
      message: 'Access denied: Team Lead only'
    });
  }
  next();
};

/**
 * CLIENT OWNS TICKET
 * Client can access only their own tickets
 * Requires req.ticket to be loaded
 */
const clientOwnsTicket = (req, res, next) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({
      message: 'Client only'
    });
  }

  if (req.ticket.client_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: 'Access denied: Not your ticket'
    });
  }

  next();
};

/**
 * MANAGER OWNS DEPARTMENT ASSIGNMENT
 * Requires req.assignment to be loaded
 */
const managerOwnsDepartment = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Manager only'
    });
  }

  if (req.assignment.department !== req.user.department) {
    return res.status(403).json({
      message: 'Access denied: Wrong department'
    });
  }

  next();
};


/**
 * MARKETING BRANCH GUARD
 * Enforced only if department is Marketing
 */
const marketingBranchGuard = (req, res, next) => {
  const assignment = req.assignment;

  if (assignment.department === 'Marketing') {
    if (!req.user.branch) {
      return res.status(403).json({
        message: 'Marketing branch missing'
      });
    }

    if (req.user.branch !== assignment.branch) {
      return res.status(403).json({
        message: 'Access denied: Wrong marketing branch'
      });
    }
  }

  next();
};

/**
 * TEAM LEAD OWNS ASSIGNMENT
 * Requires req.assignment to be loaded
 */
const teamLeadOwnsAssignment = (req, res, next) => {
  if (req.user.role !== 'USER') {
    return res.status(403).json({
      message: 'Team Lead only'
    });
  }

  if (
    !req.assignment.assigned_team_lead_id ||
    req.assignment.assigned_team_lead_id.toString() !==
      req.user._id.toString()
  ) {
    return res.status(403).json({
      message: 'Access denied: Not your assignment'
    });
  }

  next();
};

module.exports = {
  clientOnly,
  complianceOnly,
  managerOnly,
  teamLeadOnly,
  clientOwnsTicket,
  managerOwnsDepartment,
  marketingBranchGuard,
  teamLeadOwnsAssignment
};
