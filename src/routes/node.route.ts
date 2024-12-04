import { Router } from "express";
import { authenticateJwt } from "@/middleware";
import NodeController from "@/controller/node/node.controller";
import LogController from "@/controller/node/logs.controller";
import MlController from "@/controller/ai/ml.controller";
import AWSController from '@/controller/ai/aws.controller';
import TransactionController from '@/controller/user/transaction.controller';

const router = Router();
const nodeController: NodeController = new NodeController();
const logController: LogController = new LogController();
const mlController: MlController = new MlController();
const awsController: AWSController = new AWSController();
const transactionController: TransactionController = new TransactionController();


router.get("/nodes", nodeController.getAllNodes);
router.get("/active/nodes", nodeController.getAllActiveNodes);
router.get("/my-nodes", authenticateJwt, nodeController.getMyNodes);
router.get('/rental-nodes', authenticateJwt, nodeController.getMyRentalNodes)
router.post('/add/new-task', authenticateJwt, nodeController.addNewTask)
// router.get('/tasks', nodeController.addNewTask)
router.post('/lend/gpu', authenticateJwt, nodeController.lendGpu);



router.get('/logs/:taskId', logController.getLogs)


router.get("/ai/models", mlController.getAiModels);


router.post('/generate/presigned-url', awsController.generatePresignedUrl);


router.get('/aws/test', awsController.test);


router.get('/instances', awsController.getAllAvailableInstances);
router.get('/instance-types', awsController.fetchAllInstanceTypes);
router.post('/create/instance', authenticateJwt, awsController.createInstance);
router.get('/status/instance/:instanceId', authenticateJwt, awsController.getInstanceStatus);
router.get('/my-instances', authenticateJwt, awsController.getMyInstances);
router.get('/instances/keypair/:keyName', authenticateJwt, awsController.getMyKeyPair);


router.get('/transactions', authenticateJwt, transactionController.getMyTransactions);


export { router as node };
