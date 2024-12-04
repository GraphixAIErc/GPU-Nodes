import { CorsOptions } from "cors";


export let PORT = process.env.PORT || "8080";


export const NODE_ENV = process.env.NODE_ENV || "development";

export const IN_PROD = NODE_ENV === "production";

const allowedOrigins = [
    "*",
];
export const corsOptions: CorsOptions = {
    origin: "*",

};

export const logDirPath = process.env.LOG_DIR || 'logs';

export const JWT_SECRET = "oh man i didnt have thios gug sa d?";



