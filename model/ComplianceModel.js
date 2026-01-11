const moongoose = require('mongoose');
require('dotenv').config();     

const complianceSchema = new moongoose.Schema({ 

    reviewByCompliance:{
        type: Boolean,
        default: false
    }
}, { timestamps: true }
);  

module.exports = moongoose.model('Compliance', complianceSchema);