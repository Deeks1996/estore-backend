import express from 'express';
import adminSignup from './register.js';
import adminLogin from './login.js'; 

const router = express.Router();


router.post('/register', adminSignup);
router.post('/login', adminLogin);  

export default router;