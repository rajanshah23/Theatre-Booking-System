import { Response } from "express";

const sendResponse = (res: Response, statusNumber: number, message: string, data: any = null) => {
  res.status(statusNumber).json({
    message,
    data: data === undefined || data === null ? null : data
  });
}


export default sendResponse;
