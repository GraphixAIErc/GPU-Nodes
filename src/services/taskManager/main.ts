//TODO: SIMPLE TASK MANAGER

import { getAppropriateNode } from "../prisma/node";
import { fetchTaskById } from "../prisma/task";
import { emitNewTask } from "../socketio/emmiter";

export const simpleTaskManager = async (taskId: string) => {

    try {
        const pendingTask = await fetchTaskById(taskId);
        const node = await getAppropriateNode(pendingTask);
        if (!node || !node.socketId) throw new Error("No active nodes found");
        
        emitNewTask(node.socketId, pendingTask)

    } catch (err) {
        console.log(err)
    }

}