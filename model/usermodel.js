const moongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new moongoose.Schema({  
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true},
    phone: { type: String, required: true },
    verified: { type: Boolean, default: false },
  
    role: {
    type: String,
    enum: ['CLIENT', 'SUPER_ADMIN', 'ADMIN', 'USER'],
    required: true
  },
    department: {
    type: String,
    enum: ['Compliance', 'Resume', 'Marketing', 'Technical', 'Sales'],
    default: null
  },
  
  branch: {
    type: String,
    enum: ['AHM', 'LKO', 'GGR'],
    default: null
  },
    password: { type: String, required: true },

    status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },


}, { timestamps: true });

userSchema.pre('save', async function () {
  try {
    
    if (!this.isModified('password')) {
      return ;
    }

    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);

    this.password = hashedPassword;
  
  } catch (error) {
    throw error;
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = moongoose.model('User', userSchema);