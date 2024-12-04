import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    const status = 500;
    const message = err.message || 'Internal server error';
    console.error(message);
    res.status(status).send({ success: false, message });
}
