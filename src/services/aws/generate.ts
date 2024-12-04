import { awsS3 } from "./main";


export const generateAwsPresignedUrl = async (fileName: string, fileType:string) => {

    const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Expires: 60 * 10,
        // ACL: 'public-read',
        ContentType: fileType,
        // ACL: 'bucket-owner-full-control',
    };
    const presignedUrl = await awsS3.getSignedUrlPromise('putObject', s3Params);
    return presignedUrl;
}


// export const replaceS3Urls = async (obj: any): Promise<any> => {
//     for (const key in obj) {
//         if (typeof obj[key] === 'object') {
//             obj[key] = await replaceS3Urls(obj[key]);  // Recursive call for nested objects
//         } else if (typeof obj[key] === 'string' && obj[key].startsWith('s3://')) {
//             obj[key] = await generateAwsPresignedUrl(obj[key].split('s3://')[1]);  // Generate pre-signed URL
//         }
//     }
//     return obj;

    
// }


// app.post('/generate-presigned-url', (req, res) => {
//     const { fileName, fileType } = req.body;
  
//     const s3Params = {
//       Bucket: S3_BUCKET,
//       Key: fileName,
//       Expires: 60,
//       ContentType: fileType,
//       ACL: 'public-read',
//     };
  
//     s3.getSignedUrl('putObject', s3Params, (err, url) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.json({ url });
//     });
//   });