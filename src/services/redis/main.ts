
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";


const REDIS_HOST = "c15.us-east-1-2.ec2.cloud.redislabs.com"
const REDIS_PORT = "14673"
const REDIS_PASSWORD = "E3UYY7nXu88KAPaeHdXcEJKiVrCKcawu"

const url = `redis://default:${REDIS_PASSWORD}@redis-${REDIS_PORT}.${REDIS_HOST}:${REDIS_PORT}`


export const pubClient = createClient({ url });
export const subClient = pubClient.duplicate();
