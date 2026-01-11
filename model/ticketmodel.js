const moongoose = require('mongoose');  

const ticketSchema = new moongoose.Schema({
     // MongoDB _id === ticket_id

referenceID: { type: String },
 parent_ticket_id: {
      type: moongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null
    },
 
    clientID:{
        type:moongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String,
        enum:["Low", "Medium", "High", "Urgent"] ,
        required: true },

    status: {
      type: String,
      enum: [
        'In Compliance Review',
        'Waiting for Client',
        'In Resolution',
        'Ready to Close',
        'Closed'
      ],
      default: 'In Compliance Review',
      index: true
    },
    reopenCount: { type: Number, default: 0 },
    warningFlag: { type: Boolean, default: false },
    contact_email  : { type: String, required: true },
    contact_phone  : { type: String, required: true },
    closedAt: { type: Date }
},
 { timestamps: true }
);

module.exports = moongoose.model('Ticket', ticketSchema);