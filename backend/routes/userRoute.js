import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateUser, changePassword } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';


const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);


//procted route
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateUser);
userRouter.put('/password', authMiddleware, changePassword);

export default userRouter;
