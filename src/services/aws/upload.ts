import { ManagedUpload } from "aws-sdk/clients/s3";
import { awsS3, getBucketName } from "./main";
import { generateRandomString } from "@/utils";


export const uploadImageFromUrl = async (url: string, userId: string): Promise<ManagedUpload.SendData> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = response.headers.get('Content-Type');
    if (!contentType) throw new Error('no content type found');

    const fileExtension = contentType.split('/')[1] || 'jpg'; // Default to jpg if not found
    const params = {
        Bucket: getBucketName(),
        Key: `generatedImages/${userId}/${generateRandomString(10)}.${fileExtension}`,
        Body: buffer,
        ContentType: contentType,
    };
    const res = await awsS3.upload(params).promise();
    console.log(res);
    return res;
};