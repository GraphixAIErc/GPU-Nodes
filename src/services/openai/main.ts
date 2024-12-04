

import OpenAI from "openai";
import fs from 'fs'
// import sharp from 'sharp';

const openai = new OpenAI();

type ISize = '1024x1024' | '1792x1024' | '1024x1792' | null;
type IQuality = 'standard' | 'hd';
type IVariationSize = "1024x1024" | "256x256" | "512x512"

export const generateImage = async (prompt: string, size: ISize, quality: IQuality) => {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality
    });

    return response.data[0];
}

export const openaiCreateVariation = async (image: any, size: IVariationSize): Promise<string> => {
    if (!image) throw new Error('no image provided');

    const tempPath = (image.path).split('.').slice(0, -1).join('.') + '-temp.png';

    // await sharp(image.path).png().toFile(tempPath);


    const response = await openai.images.createVariation({
        image: fs.createReadStream(tempPath),
        // model: "dall-e-3",
        size: size
    });
    if (!response.data[0].url) {
        throw new Error('no url generated')
    }


    // After processing, delete the original uploaded file
    fs.unlink(image.path, (err) => {
        if (err) {
            console.error(`Failed to delete the original file: ${image.path}`, err);
        } else {
        }
    });

    // If you have a temporary file that needs deletion, similarly:
    // Replace 'tempFilePath' with your temporary file path variable
    fs.unlink(tempPath, (err) => {
        if (err) {
            console.error(`Failed to delete the temporary file: ${tempPath}`, err);
        } else {
        }
    });

    return response.data[0].url;
} 