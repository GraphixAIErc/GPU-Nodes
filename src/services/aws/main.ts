import aws from 'aws-sdk';


aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION,
});


export const awsS3 = new aws.S3();
export const awsEC2 = new aws.EC2();
export const awsPricing = new aws.Pricing();


export const getBucketName = (): string => {
    let bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
        bucketName = "graphixai"
    }
    return bucketName;
}