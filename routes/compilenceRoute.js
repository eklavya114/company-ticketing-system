const express = require('express');
const router = express.Router();

const complianceController = require('../controller/compilenceController');
const { authenticateToken } = require('../middleware/auth');
const { complianceOnly } = require('../middleware/rbac');

/**
 * Compliance only (SUPER_ADMIN)
 * View tickets waiting for compliance review
 */
router.get(
  '/compliance/queue',
  authenticateToken,
  complianceOnly,
  (req, res) => complianceController.getComplianceQueue(req, res)
);

/**
 * Compliance only (SUPER_ADMIN)
 * View tickets ready to close (pending final review)
 */
router.get(
  '/compliance/ready-to-close',
  authenticateToken,
  complianceOnly,
  (req, res) => complianceController.getReadyToCloseQueue(req, res)
);

/**
 * Compliance only (SUPER_ADMIN)
 * Approve ticket & assign departments
 */
router.post(
  '/compliance/tickets/:ticketId/approve',
  authenticateToken,
  complianceOnly,
  (req, res) => complianceController.approveTicket(req, res)
);

router.post(
  '/compliance/tickets/:ticketId/close',
  authenticateToken,
  complianceOnly,
  (req, res) => complianceController.closeTicket(req, res)
);


module.exports = router;
