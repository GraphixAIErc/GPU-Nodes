import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import morgan from "morgan";
// import { notFound, serverError } from "./middleware";
// import { corsOptions, IN_PROD } from "./config";
import { node, user, openai, data, reward } from "./routes"
import { IN_PROD, corsOptions } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { claimRewardEvent } from "./services/ethers/rewardClaimed"
// import { morganOption } from "./config";

export const createApp = () => {
  const app = express();

  // app.use(morgan('combined', morganOption));  

  //config
  app.use(cors(corsOptions));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  app.use(bodyParser.json({ limit: '50mb' }));

  //routers
  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send({
      name: "Graphix Server",
      message: "online",
      prod: IN_PROD
    });
  });

  app.use("/api", user);
  app.use("/api", openai);
  app.use("/api", node);
  app.use("/api", data);
  app.use("/api", reward)
  // app.use("/api", ai);



  //error handles
  app.use(errorHandler);
  // app.use(notFound);
  // app.use(serverError);

  claimRewardEvent()

  return app;
};

