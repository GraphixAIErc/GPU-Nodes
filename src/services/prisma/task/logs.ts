import { prisma } from "../main";

interface LogEntry {
    message: string,
    timestamp: string
}

export const FullLogs: any = {};


export async function addLogToTask(taskId: string, logEntry: LogEntry) {
    if (!FullLogs[taskId]) {
        FullLogs[taskId] = [];
    }
    FullLogs[taskId].push(logEntry);


    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { logs: true }
    });

    if (!task) {
        throw new Error(`Task with ID ${taskId} not found.`);
    }

    await prisma.task.update({
        where: { id: taskId },
        data: { logs: FullLogs[taskId] }
    });

    console.log(`Log entry added to task ${taskId}`);
}


export const fetchLogsOfTask = async (taskId: string) => {
    return await prisma.task.findUnique({
        where: {
            id: taskId
        },
        select: {
            logs: true
        }
    });
}