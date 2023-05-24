import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { apiKey, description } = req.body;

  try {
    var data = JSON.stringify({
      idempotencyKey: "dd1bcdf3-9f10-4a39-a664-93d34fe83448",
      description: description,
    });

    var config = {
      method: "post",
      url: "https://api-sandbox.circle.com/v1/wallets",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(response.data);
        return res.status(200).json({ data: response.data });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error: any) {
    console.log(error.response);
    return res.status(400).json({ data: error.response.data });
  }
}

//-- Test with postman (get request)
//-- http://localhost:3000/api/createWallet
