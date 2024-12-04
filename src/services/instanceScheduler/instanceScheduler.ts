import { fetchRunningInstances } from "../prisma/instance";
import { terminateAwsInstance } from "../aws/intances"
import { fetchAllRentedNodes, updateRemoveRentedNode } from "../prisma/node";
import { user } from "@/routes";
import { emitRevokeLendNode } from "../socketio/emmiter";
import { updateBalance } from "../prisma/user";



export class InstanceScheduler {
    private interval: number = 1000 * 60 * 30; // 30 minutes
    private timer: NodeJS.Timeout | null = null;

    constructor() {
        // this.interval = interval;
    }

    public start(): void {
        if (this.timer) {
            console.log('Scheduler is already running.');
            return;
        }
        console.log('Starting scheduler...');
        this.timer = setInterval(() => this.checkInstances(), this.interval);
    }

    public stop(): void {
        if (!this.timer) {
            console.log('Scheduler is not running.');
            return;
        }
        console.log('Stopping scheduler...');
        clearInterval(this.timer);
        this.timer = null;
    }

    private async checkInstances(): Promise<void> {
        try {
            const currentTime = new Date();
            // const instance = await fetchRunningInstances()
            // instance.map(async (instance: any) => {
            //     if (currentTime > instance.expireAt) {
            //         //await terminateAwsInstance(instance)
            //     }
            // })

            const nodes = await fetchAllRentedNodes()
            nodes.map(async (node: any) => {
                if (currentTime > node.expireAt) {
                    await emitRevokeLendNode(node.socketId, { username: node.rentedById })

                    const differenceInMilliseconds = node.expireAt.getTime() - node.startedAt.getTime();
                    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

                    const neededCredits = node.price * differenceInHours;
                    await updateBalance(node.ownerId, "ADD", neededCredits);

                    await updateRemoveRentedNode(node.id)

                    //await terminateAwsInstance(instance)
                }
            })

        } catch (e) {
            console.log(e)
        }
    }

    // public addInstance(instance: Instance): void {
    //   //  this.instances.push(instance);
    // }

    // public removeInstance(instanceId: string): void {
    //   //  this.instances = this.instances.filter(instance => instance.instanceId !== instanceId);
    // }
}