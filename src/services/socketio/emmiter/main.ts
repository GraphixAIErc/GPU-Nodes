import { pubClient } from "@/services/redis";

import { Emitter } from "@socket.io/redis-emitter"

const emitter = new Emitter(pubClient);

const mainEmitter = emitter.of("/");

export const emitTest = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: test", payload);
};


export const emitNewTask = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: NEW_TASK", payload);
};

export const emitCommand = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: COMMAND'", payload);
};

export const emitLendNode = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: LEND_GPU", payload);
};

export const emitRevokeLendNode = (socketID: string, payload: any) => {
  mainEmitter.to(socketID).emit("BMAIN: REVOKE_LENDING", payload);
};


