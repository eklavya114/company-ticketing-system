const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Tracks all system events for compliance and traceability
 */
const auditLogSchema = new mongoose.Schema(
    {
        event_type: {
            type: String,
            required: true,
            enum: [
                // Ticket Lifecycle
                'TICKET_CREATED',
                'TICKET_APPROVED',
                'TICKET_REJECTED',
                'TICKET_CLOSED',
                'TICKET_STATUS_CHANGED',

                // Reopen Flow
                'TICKET_REOPEN_REQUESTED',
                'SISTER_TICKET_CREATED',
                'REOPEN_COUNT_UPDATED',
                'WARNING_FLAG_SET',

                // Department Assignments
                'DEPARTMENTS_ASSIGNED',
                'TEAM_LEAD_ASSIGNED',
                'ASSIGNMENT_STATUS_UPDATED',
                'ASSIGNMENT_RESOLVED',

                // Compliance Actions
                'COMPLIANCE_DECISION',
                'FINAL_REVIEW_COMPLETED'
            ],
            index: true
        },

        ticket_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            index: true
        },

        reference_id: {
            type: String,
            index: true
        },

        actor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        actor_role: {
            type: String,
            enum: ['CLIENT', 'SUPER_ADMIN', 'ADMIN', 'USER', 'SYSTEM'],
            required: true
        },

        // Event-specific data (flexible JSON)
        payload: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        // Optional decision reason for compliance actions
        decision_reason: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

// Compound index for efficient queries
auditLogSchema.index({ ticket_id: 1, createdAt: -1 });
auditLogSchema.index({ reference_id: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
