const express = require('express');
const router = express.Router();

const ticketController = require('../controller/ticketController');
const { authenticateToken } = require('../middleware/auth');
const { clientOnly } = require('../middleware/rbac');

router.post(
  '/tickets',
  authenticateToken,
  clientOnly,
  (req, res) => ticketController.createTicket(req, res)
);

router.post(
  '/tickets/:ticketId/reopen',
  authenticateToken,
  clientOnly,
  (req, res) => ticketController.reopenTicket(req, res)
);

router.get(
  '/tickets/history/:referenceId',
  authenticateToken,
  (req, res) => ticketController.getTicketHistory(req, res)
);

module.exports = router;
