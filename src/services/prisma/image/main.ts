import { prisma } from "../main";

export type IImage = {
    url: string;
    type: string;
    prompt: string;
    model: string;
    size?: string;
    quality?: string;
};

export const saveImage = async (userId: string, image: IImage) => {
    const savedImage = await prisma.image.create({
        data: {
            url: image.url,
            type: image.type,
            prompt: image.prompt,
            model: image.model,
            size: image.size,
            quality: image.quality,
            userId: userId,
        },
    });
    return savedImage;
}
export const getImages = async () => {
    const images = await prisma.image.findMany({
        take: 10,
        orderBy: {
            createdAt: 'desc'
        }
    });
    return images;
}