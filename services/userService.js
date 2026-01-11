const UserRepository = require('../repository/userRepositoy');

class UserService { 
async registerUser(userData) {
    if(!userData.name||
         !userData.email||
            !userData.phone||
            !userData.password
        ){
                throw new Error('All fields are required');
            }

    const emailexists = await UserRepository.getUserByEmail(userData.email);
    if(emailexists){
        throw new Error('Email already in use');
    }

    return await UserRepository.createUser(userData);        
}       
async modifyUser(userId, updateData) {
        if( !userId || Object.keys(updateData).length===0){
            throw new Error('User ID and update data are required');
        }
        if(updateData.email){
            throw new Error('Email cannot be updated');
        }
    return await UserRepository.updateUser(userId, updateData);        

}

async fetchUserById(userId) {
    if(!userId){
        throw new Error('User ID is required');
    }
    return await UserRepository.getUserById(userId);
}
async fetchUserByEmail(email) {
    if(!email){
        throw new Error('Email is required');
    }
    return await UserRepository.getUserByEmail(email);
}
}
module.exports = new UserService();