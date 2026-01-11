const UserController = require('../controller/userController');
const userloginController = require('../controller/authUserController');

const UserRouter = new UserController();


const jwtauth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.post('/register', UserRouter.register);
router.put('/auth/update/:id',jwtauth.authenticateToken ,UserRouter.update);
router.get('/auth/get/:id',jwtauth.authenticateToken, UserRouter.getById); 

router.post('/login', userloginController.login);
router.post('/auth/logout',jwtauth.authenticateToken, userloginController.logout);
router.post('/auth/token',jwtauth.authenticateToken, userloginController.accessTokenGenerator);

module.exports = router;