const AuditLog = require('../model/AuditLog');

/**
 * Audit Service
 * Centralized logging for all system events
 */
class AuditService {
    /**
     * Log an audit event
     * @param {string} eventType - Event type from AuditLog enum
     * @param {Object} options - Event options
     * @param {string} options.ticketId - Associated ticket ID
     * @param {string} options.referenceId - Reference ID for grouped tickets
     * @param {string} options.actorId - User who performed action
     * @param {string} options.actorRole - Role of the actor
     * @param {Object} options.payload - Event-specific data
     * @param {string} options.decisionReason - Optional reason for compliance decisions
     */
    async logEvent(eventType, options = {}) {
        try {
            const auditEntry = new AuditLog({
                event_type: eventType,
                ticket_id: options.ticketId || null,
                reference_id: options.referenceId || null,
                actor_id: options.actorId,
                actor_role: options.actorRole || 'SYSTEM',
                payload: options.payload || {},
                decision_reason: options.decisionReason || null
            });

            await auditEntry.save();
            console.log(`[AUDIT] ${eventType}`, options.payload);
            return auditEntry;
        } catch (error) {
            // Don't fail the main operation if audit logging fails
            console.error('[AUDIT ERROR]', eventType, error.message);
            return null;
        }
    }

    /**
     * Get all audit logs for a specific ticket
     */
    async getAuditsByTicket(ticketId) {
        return AuditLog.find({ ticket_id: ticketId })
            .sort({ createdAt: -1 })
            .populate('actor_id', 'name email role');
    }

    /**
     * Get all audit logs for a reference group (all sister tickets)
     */
    async getAuditsByReference(referenceId) {
        return AuditLog.find({ reference_id: referenceId })
            .sort({ createdAt: -1 })
            .populate('actor_id', 'name email role');
    }

    /**
     * Get recent audit activity (for dashboards)
     */
    async getRecentActivity(limit = 50) {
        return AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('actor_id', 'name email role')
            .populate('ticket_id', 'title referenceID status');
    }

    // --- Convenience Methods ---

    async logTicketCreated(ticket, actorId, actorRole) {
        return this.logEvent('TICKET_CREATED', {
            ticketId: ticket._id,
            referenceId: ticket.referenceID,
            actorId,
            actorRole,
            payload: {
                title: ticket.title,
                priority: ticket.priority,
                status: ticket.status
            }
        });
    }

    async logTicketApproved(ticketId, referenceId, departments, actorId, decisionReason) {
        return this.logEvent('TICKET_APPROVED', {
            ticketId,
            referenceId,
            actorId,
            actorRole: 'SUPER_ADMIN',
            payload: { departments },
            decisionReason
        });
    }

    async logDepartmentsAssigned(ticketId, referenceId, departments, actorId) {
        return this.logEvent('DEPARTMENTS_ASSIGNED', {
            ticketId,
            referenceId,
            actorId,
            actorRole: 'SUPER_ADMIN',
            payload: { departments: departments.map(d => d.name || d) }
        });
    }

    async logTeamLeadAssigned(assignment, teamLeadId, managerId) {
        return this.logEvent('TEAM_LEAD_ASSIGNED', {
            ticketId: assignment.ticket_id,
            actorId: managerId,
            actorRole: 'ADMIN',
            payload: {
                assignmentId: assignment._id,
                department: assignment.department,
                teamLeadId
            }
        });
    }

    async logAssignmentStatusUpdated(assignment, newStatus, oldStatus, actorId) {
        return this.logEvent('ASSIGNMENT_STATUS_UPDATED', {
            ticketId: assignment.ticket_id,
            actorId,
            actorRole: 'USER',
            payload: {
                assignmentId: assignment._id,
                department: assignment.department,
                oldStatus,
                newStatus
            }
        });
    }

    async logTicketClosed(ticket, actorId) {
        return this.logEvent('TICKET_CLOSED', {
            ticketId: ticket._id,
            referenceId: ticket.referenceID,
            actorId,
            actorRole: 'SUPER_ADMIN',
            payload: {
                closedAt: ticket.closedAt
            }
        });
    }

    async logReopenRequested(oldTicketId, referenceId, clientId) {
        return this.logEvent('TICKET_REOPEN_REQUESTED', {
            ticketId: oldTicketId,
            referenceId,
            actorId: clientId,
            actorRole: 'CLIENT',
            payload: { originalTicketId: oldTicketId }
        });
    }

    async logSisterTicketCreated(newTicket, parentTicketId, actorId) {
        return this.logEvent('SISTER_TICKET_CREATED', {
            ticketId: newTicket._id,
            referenceId: newTicket.referenceID,
            actorId,
            actorRole: 'CLIENT',
            payload: {
                newTicketId: newTicket._id,
                parentTicketId,
                reopenCount: newTicket.reopenCount
            }
        });
    }

    async logWarningFlagSet(ticket, actorId) {
        return this.logEvent('WARNING_FLAG_SET', {
            ticketId: ticket._id,
            referenceId: ticket.referenceID,
            actorId,
            actorRole: 'SYSTEM',
            payload: {
                reopenCount: ticket.reopenCount,
                warningFlag: true
            }
        });
    }
}

module.exports = new AuditService();
