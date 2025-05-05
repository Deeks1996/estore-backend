import express from 'express';
import registerUser from './register.js';
import loginUser from './login.js'; 

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);  

export default router;

