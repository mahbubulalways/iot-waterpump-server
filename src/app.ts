import express, { Application, Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";

const app: Application = express();
app.use(express());
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    statusCode: StatusCodes.OK,
    success: true,
    message: "Server is Running!!!!!!!!!!!!!!!!",
  });
});

export default app;
