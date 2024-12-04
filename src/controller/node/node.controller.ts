import { lendNodeGpu } from "@/services/nodeManager";
import { fetchAllActiveNodes, fetchAllNodes, fetchMyNodes, fetchMyRentalNodes } from "@/services/prisma/node";
import { saveTask } from "@/services/prisma/task";
import { simpleTaskManager } from "@/services/taskManager";
import { NextFunction, Request, Response } from "express";


class NodeController {

    public async getAllNodes(req: Request, res: Response, next: NextFunction) {
        try {
            const activeNodes = await fetchAllNodes();
            return res.status(200).send(activeNodes);
        } catch (err) {
            next(err);
            return;
        }
    }

    public async getAllActiveNodes(req: Request, res: Response, next: NextFunction) {
        try {
            const activeNodes = await fetchAllActiveNodes();
            return res.status(200).send(activeNodes);
        } catch (err) {
            next(err);
            return;
        }
    }

    public async getMyNodes(req: Request, res: Response, next: NextFunction) {
        try {
            const nodes = await fetchMyNodes(req.user.id);
            return res.status(200).send(nodes);
        } catch (err) {
            next(err);
            return;
        }
    }

    public async getMyRentalNodes(req: Request, res: Response, next: NextFunction) {
        try {
            const nodes = await fetchMyRentalNodes(req.user.id);
            return res.status(200).send(nodes);
        } catch (err) {
            next(err);
            return;
        }
    }

    public async addNewTask(req: Request, res: Response, next: NextFunction) {
        try {

            const { task, aiModel } = await saveTask(req.user.id, req.body);

            await simpleTaskManager(task.id)

            return res.status(200).send({ sucess: "Task added successfully", data: { task, aiModel } });
        } catch (err) {
            next(err);
            return;
        }
    }
    public async lendGpu(req: Request, res: Response, next: NextFunction) {
        try {

            const { nodeId, duration } = req.body;
            if (!nodeId) throw new Error("Node not found")

            const response = await lendNodeGpu(req.user.id, nodeId, duration);

            return res.status(200).send({ sucess: "Lended successfully", data: response });
        } catch (err) {
            next(err);
            return;
        }
    }





}
export default NodeController;
