import { Response } from "express";
import sendResponse from "./sendResponse";

const checkOtpExpiration = (
  res: Response,
  otpGeneratedTime: string,
  thresholdTime: number
): boolean => {
  const currentTime = Date.now();
  if (currentTime - parseInt(otpGeneratedTime) <= thresholdTime) {
    // OTP NOT expired
    sendResponse(res, 200, "Valid OTP, now you can proceed to reset password 😌");
    return false; // not expired
  } else {
    // OTP expired
    sendResponse(res, 403, "OTP expired, Sorry try again later 😭!!");
    return true; // expired
  }
};

export default checkOtpExpiration;
