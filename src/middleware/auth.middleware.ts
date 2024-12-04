import { verifyJWTToken } from "@/services/jwt";
import { getUser } from "@/services/prisma/user";
import { IUser } from "@/types";
import { Request, Response, NextFunction } from "express";

export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token || token === "" || token == undefined)
      throw new Error("no token");

    let user = await verifyToken(token);
    req.user = user;
    // throw new Unauthorized('no user found')
    if (req.user === undefined) {
      throw new Error("internal Error");
    }
    next();
  } catch (err: any) {
    next(err);
  }
};
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const authHeader = req.headers["authorization"];
    // const token = authHeader && authHeader.split(" ")[1];
    // let user = (await verifyToken(token)) as IUser;
    // req.user = user;
    // // throw new Unauthorized('no user found')
    // if (req.user === undefined) {
    //   throw new Error("internal Error");
    // }
    // if (req.user.role !== "ADMIN") {
    //   throw new Error("unauthorised (admin only)")
    // }
    next();
  } catch (err: any) {
    next(err);
  }
};

export const verifyToken = async (token: string):Promise<IUser> => {

  let payload = await verifyJWTToken(token)

  const user = await getUser(payload.publicAddress);

  if (!user) throw new Error("no user found");

  return user;
};
