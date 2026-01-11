const userModel = require('../model/usermodel');

class UserRepository {  
async createUser(userData) {
    const user = new userModel(userData);
    return await user.save();           
}
async updateUser(userId, updateData) {
    return await userModel.findByIdAndUpdate(userId, updateData, { new: true });    
}
async getUserById(userId) {
    return await userModel.findById(userId);        
}
async getUserByEmail(email) {
    return await userModel.findOne({ email }).select('+password');        
}
}
module.exports = new UserRepository();
