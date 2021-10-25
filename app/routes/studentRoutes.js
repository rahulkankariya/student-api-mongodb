
module.exports = app =>{
    
    const middleware = require('../middleware/middleware')
    const studentConfig = require('../controllers/studentControllers');
    const authConfig = require('../controllers/authControllers');
    const router = require('express').Router();
    router.post('/register',studentConfig.register);
    router.post('/login',authConfig.login);
    router.post('/forgot-password',authConfig.forgotPassword);
    router.post('/reset-password',middleware.refreshToken,authConfig.resetPassword)
    router.patch('/update-profile',middleware.refreshToken,studentConfig.studentUpdateProfile);
    router.patch('/change-password',studentConfig.changePassword);
    router.post('/refresh-token',authConfig.refreshToken);
    app.use('/',router);
};