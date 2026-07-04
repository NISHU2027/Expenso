import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env.js';

export default async function authMiddleware(req, res, next) {
    
    //grad the token
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return res.status(401).json({ 
            success: false,
            message: "Not authorized or token missing." 
        });
    }

    //verify token
    try {
        const payload = jwt.verify(token, getJwtSecret());
        const user = await User.findById(payload.id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found." 
            });
        }
        req.user = user;  //attach user to request
        next();  //proceed to next middleware or route handler

    }
    catch (err) {
        if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
            console.error("JWT ERROR:", err.message);
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }

        console.error("AUTH DB ERROR:", err.message);
        return res.status(503).json({
            success: false,
            message: "Database unavailable.",
        });
    }
}
