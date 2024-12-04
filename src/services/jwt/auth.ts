import { JWT_EXPIRATION, JWT_SECRET } from '@/config'
import jwt from 'jsonwebtoken'


export const generateAuthToken = (userId: string, publicAddress: string) => {
    return jwt.sign({ userId, publicAddress }, JWT_SECRET, { expiresIn: JWT_EXPIRATION })
}



export const verifyJWTToken = async (token: string): Promise<jwt.JwtPayload> => {
    return await jwt.verify(
        token,
        JWT_SECRET) as jwt.JwtPayload
}