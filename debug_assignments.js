const mongoose = require('mongoose');
require('dotenv').config();

async function checkAssignments() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');

        const DepartmentAssignment = require('./model/ComplianceModel');
        const User = require('./model/usermodel');

        // Find all team leads
        const teamLeads = await User.find({ role: 'USER' }).select('_id name email department');
        console.log('\n=== Team Leads ===');
        teamLeads.forEach(tl => console.log(`${tl._id} - ${tl.name} (${tl.department})`));

        // Find all department assignments
        const allAssignments = await DepartmentAssignment.find()
            .populate('assigned_team_lead_id', 'name')
            .populate('ticket_id', 'title');

        console.log('\n=== All Assignments ===');
        allAssignments.forEach(a => {
            console.log(`Assignment: ${a._id}`);
            console.log(`  Department: ${a.department}`);
            console.log(`  Status: ${a.status}`);
            console.log(`  Team Lead ID: ${a.assigned_team_lead_id?._id || 'Not assigned'}`);
            console.log(`  Team Lead Name: ${a.assigned_team_lead_id?.name || 'N/A'}`);
            console.log(`  Ticket: ${a.ticket_id?.title || a.ticket_id}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAssignments();
