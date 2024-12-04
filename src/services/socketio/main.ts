import { verifyToken } from "@/middleware"
import { Server } from "socket.io"
import { freeTheNode } from "../prisma/node"
import { addLogToTask } from "../prisma/task/logs"
import { pubClient } from "../redis"
import { RewardService } from "../reward"
import { handleDisconnect, handleInitiateNode } from "./handler"

export const initalizeSocketIO = async (io: Server) => {
  const mainIO = io.of("/")

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization
      const token = authHeader && authHeader.split(" ")[1]

      if (!token || token === "" || token == undefined)
        throw new Error("no token")

      if (!token) {
        return next(new Error("No token provided"))
      }
      const user = await verifyToken(token)
      socket.user = user
      next()
    } catch (err) {
      console.log(err)
      socket.emit("BMAIN: error", { message: "Invalid Token" })
      socket.disconnect(true)
      next(new Error("Invalid Token"))
    }
  })

  mainIO.on("connection", (socket) => {
    const socketId = socket.id
    const userId = socket.user.id

    const rewardService = new RewardService({ mainIO, socketId })
    
    console.log("New Connection: ", socketId)
    pubClient.set(`userId:${userId}`, socketId)

    socket.on("initialconfig", async (data) => {
      try {
        const response = await handleInitiateNode(socketId, userId, data)
        rewardService.start(userId, response.id)
        socket.emit("BMAIN: initialconfig", response)
      } catch (err) {
        socket.emit("BMAIN: error", { message: "Error in initial config" })
        console.log(err)
      }
    })

    socket.on("BMAIN: logs", (data) => {
      addLogToTask(data.taskId, {
        message: data.message,
        timestamp: new Date().toISOString(),
      })
      console.log(data)
    })

    socket.on("BMAIN: execute_error", async (data) => {
      console.log(data)
      await freeTheNode(socketId)
    })

    // socket.on("test", (data) => {
    //     socket.emit("task_update", `Echo back: ${data.message}`);
    // });

    socket.on("disconnect", async () => {
      console.log("Disconnect: ", socketId)
      try {
        rewardService.end(userId)
        await pubClient.del(`userId:${userId}`)
        await handleDisconnect(socketId)
      } catch (err) {
        console.log(err)
      }
    })
  })
}
