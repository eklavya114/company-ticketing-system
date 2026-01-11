const userService = require('../services/userService');
const user= require('../model/usermodel');
const {generateAccessToken,generateRefreshToken}= require('../utils/jwt');
const {accessTokenobj,refreshTokenobj}= require('../utils/tokenObj');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
          const { email, password } = req.body;  
           
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
          console.log(req.body);

        const user = await  userService.fetchUserByEmail(email);
        console.log(user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        //generate tokens
        const accessToken =   generateAccessToken({ id: user._id, role: user.role, department: user.department, branch: user.branch });
        const refreshToken = generateRefreshToken({ id: user._id });

        res.cookie('accessToken', accessToken, accessTokenobj); 
        res.cookie('refreshToken', refreshToken, refreshTokenobj);
    
        res.status(200).json({ message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role   
         }
        }
        );
        
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
};

const logout = async (req, res) => {
    try {
        res.clearCookie('accessToken');     
        res.clearCookie('refreshToken');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }       
};

const accessTokenGenerator = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_JWT_SECRET
    );

    console.log('REFRESH PAYLOAD:', payload);

    const user = await userService.fetchUserById(payload.sub);

    const accessToken = generateAccessToken({
      _id: user._id,
      role: user.role
    });

    res.cookie('accessToken', accessToken, accessTokenobj);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error)
    console.error('Error generating access token:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
  
module.exports = {
    login,
    logout,
    accessTokenGenerator
};