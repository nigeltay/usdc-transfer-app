import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
// import uuid from "uuid-random";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { apiKey, walletId } = req.body;

  // var data = JSON.stringify({
  //   idempotencyKey: uuid(),
  //   description: description,
  // });

  var config = {
    method: "get",
    url: `https://api-sandbox.circle.com/v1/wallets/${walletId}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };

  axios(config)
    .then(function (response) {
      // console.log(response.data);
      return res.status(200).json({ responseData: response.data });
    })
    .catch(function (error) {
      console.log(error.response.data);
      return res.status(400).json({ error: error.response.data });
    });
}
