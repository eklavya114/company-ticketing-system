const UserService  = require('../services/userService');


class UserController { 
async register(req, res) {
    try {
    if(!req.body){
        throw new Error('Request body is missing');
    }
        const userData = req.body;      
        const user = await UserService.registerUser(userData);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }
}
async update(req, res) {
    try {
    const userId = req.params.id;
    const updateData = req.body;
        const updatedUser = await UserService.modifyUser(userId, updateData);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

async getById(req, res) {
    try {
    const userId = req.params.id;    
        const user = await UserService.fetchUserById(userId);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

}

module.exports = UserController;