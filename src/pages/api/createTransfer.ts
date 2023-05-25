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
      id: "1012630045", //business account wallet ID
    },
    destination: {
      type: "blockchain",
      address: "0x251b00f8d6ec75e282080265d24d1e6592dd6ee6", //target walletId or blockchain address
      chain: "ETH",
    },
    amount: {
      amount: "10.00", //transfer all the USDC amount the treasury has
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
