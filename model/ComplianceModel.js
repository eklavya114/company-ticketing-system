const mongoose = require('mongoose');

const departmentAssignmentSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true
    },

    department: {
      type: String,
      enum: ['Resume', 'Marketing', 'Sales', 'Technical', 'Compliance'],
      required: true
    },

    // Only required if department === Marketing
    branch: {
      type: String,
      enum: ['AHM', 'LKO', 'GGR'],
      default: null
    },

    assigned_manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    assigned_team_lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    status: {
      type: String,
      enum: [
        'Not Assigned',
        'Assigned to Team Lead',
        'In Progress',
        'Waiting for Client',
        'Resolved'
      ],
      default: 'Not Assigned'
    },

    // Team Lead's resolution notes/review
    review_notes: {
      type: String,
      default: null
    },

    resolved_at: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'DepartmentAssignment',
  departmentAssignmentSchema
);
