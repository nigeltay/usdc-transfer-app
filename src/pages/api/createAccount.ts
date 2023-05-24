import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    res.status(200).json("test api success");
  } catch (error: any) {
    res.status(400).json(error.response.data);
  }
}

//-- Test with postman (get request)
//-- http://localhost:3000/api/createAccount
