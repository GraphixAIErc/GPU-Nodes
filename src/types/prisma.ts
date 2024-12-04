// export type UserType = {
//     id: string;
//     username?: string;
//     email?: string;
//     publicAddress: string;
//     nonce: number;
//     nodes: NodeType[];
//     tasks: TaskType[];
//     images: ImageType[];
//     aiModel: AIModelType[];
//     instances: InstanceType[];
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type NodeType = {
//     id: string;
//     nodeName: string;
//     gpuInfo?: any;
//     storageInfo?: any;
//     cpuInfo?: any;
//     networkInfo?: any;
//     status: string;
//     socketId: string;
//     user: UserType;
//     tasks: TaskType[];
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type AIModelType = {
//     id: string;
//     modelName: string;
//     type: string;
//     url: string;
//     configUrl: string;
//     otherUrl: any;
//     framework?: string;
//     version?: string;
//     user: UserType;
//     tasks: TaskType[];
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type TaskType = {
//     id: string;
//     title: string;
//     description?: string;
//     taskType: string;
//     status: string;
//     user: UserType;
//     aiModel: AIModelType;
//     trainingData: any;
//     trainingParameters: any;
//     nodeId?: string;
//     node?: NodeType;
//     logs: any[];
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type ImageType = {
//     id: string;
//     type?: string;
//     url: string;
//     prompt?: string;
//     model?: string;
//     size?: string;
//     quality?: string;
//     user: UserType;
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type InstanceTypeType = {
//     id: string;
//     type: string;
//     cpu: any;
//     gpu: any;
//     network: any;
//     storage: any;
//     instance: InstanceType[];
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type InstanceType = {
//     id: string;
//     instanceId: string;
//     instanceType: InstanceTypeType;
//     expireAt: Date;
//     publicIp?: string;
//     user: UserType;
//     keyPairId: string;
//     PublicIpAddress?: string;
//     status: string;
//     createdAt: Date;
//     updatedAt: Date;
// };

// export type KeyPairType = {
//     id: string;
//     keyFingerprint: string;
//     keyMaterial: string;
//     keyName: string;
//     keyPairId: string;
//     instanceId: string;
//     createdAt: Date;
//     updatedAt: Date;
// };
