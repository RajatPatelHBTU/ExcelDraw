import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import Cookie from "cookie";
export const middleware = (req: Request, res: Response, next: NextFunction) => {
    // Prefer the Authorization: Bearer <token> header; fall back to a cookie.
    const authHeader = req.headers.authorization || '';
    const headerToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length).trim()
        : undefined;
    const cookies = Cookie.parse(req.headers.cookie || '');
    const token = headerToken || cookies.token;
    if (!token) {
        res.status(401).json({
            message: "Token missing"
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        if (!decoded || !decoded.userId) {
            res.status(401).json({
                message: "Invalid decoded token"
            });
            return;
        }
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({
            message: 'Unauthorized'
        });
        return;
    }
};
