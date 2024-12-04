import { prisma } from "../main";


export const getAllAiModels = async () => {
    return await prisma.aIModel.findMany();
}