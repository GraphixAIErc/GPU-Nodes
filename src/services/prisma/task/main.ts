
import { prisma } from "../main";

export const saveTask = async (userId: string, data: any) => {
    const {
        taskType,
        description,
        modelDetails,
        trainingData,
        trainingParameters,
    } = data;

    let aiModel = await prisma.aIModel.findUnique({
        where: { id: modelDetails.modelId },
    });

    if (!aiModel) {
        aiModel = await prisma.aIModel.create({
            data: {
                modelName: modelDetails.modelName,
                type: modelDetails.modelType,
                url: modelDetails.pretrainedModelUrl,
                configUrl: modelDetails.configUrl,
                otherUrl: modelDetails.otherUrl,
                framework: modelDetails.framework,
                version: '1.0',
                userId: userId,
            },
        });
    }

    const task = await prisma.task.create({
        data: {
            title: description,
            description: description,
            taskType: taskType,
            status: 'PENDING',
            user: {
                connect: { id: userId },
            },
            aiModel: {
                connect: { id: aiModel.id },
            },
            trainingData: trainingData,
            trainingParameters: trainingParameters,

        },
    });
    return { task, aiModel };
}




export const fetchPendingTasks = async () => {
    return await prisma.task.findMany({
        where: {
            status: 'PENDING',
        }

    });
}
export const fetchTaskById = async (taskId: string) => {
    return await prisma.task.findFirst({
        where: {
            id: taskId,
        },
        include: {
            aiModel: true
        }
    });
}
