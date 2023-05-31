import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import uuid from "uuid-random";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { apiKey, walletId, amount, targetAddress } = req.body;

  var data = JSON.stringify({
    idempotencyKey: uuid(),
    source: {
      type: "wallet",
      id: walletId, //business account wallet ID
    },
    destination: {
      type: "blockchain",
      address: targetAddress, //target walletId or blockchain address
      chain: "AVAX",
    },
    amount: {
      amount: amount, //transfer all the USDC amount the treasury has
      currency: "USD",
    },
  });

  var config = {
    method: "post",
    url: "https://api-sandbox.circle.com/v1/transfers",
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
      return res.status(200).json({ responseData: response.data });
    })
    .catch(function (error) {
      console.log(error.response.data);
      return res.status(400).json({ error: error.response.data });
    });
}
