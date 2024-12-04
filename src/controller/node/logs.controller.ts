import { fetchLogsOfTask } from "@/services/prisma/task/logs";
import { NextFunction, Request, Response } from "express";


class LogController {

    public async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const logs: any = await fetchLogsOfTask(req.params.taskId);
            return res.status(200).send(logs);
        } catch (err) {
            next(err);
            return;
        }
    }




}
export default LogController;

