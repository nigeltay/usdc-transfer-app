import Image from "next/image";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/Home.module.css";
// import uuid from "uuid-random";
import axios from "axios";
import { useRouter } from "next/router";
import { Treasury } from "@/app/page";
//ABIs
import usdcABI from "../../utils/USDC.json";
import treasuryManagerABI from "../../utils/treasuryManagerABI.json";

export type Proposal = {
  title: string;
  description: string;
  withdrawAmount: number;
  targetWalletAddress: string;
  status: string;
  noOfYesVotes: number;
  noOfNoVotes: number;
  proposerAddress: string;
  proposalContractAddress: string;
};

export default function Home() {
  const router = useRouter();

  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");

  const [joinedTreasury, setHasJoinedTreasury] = useState<boolean>(false);
  const [treasuryUSDCBalance, setTreasuryUSDCBalance] =
    useState<string>("0.00");
  const [USDCAmount, setUSDCAmount] = useState<string>("");

  const [loadedData, setLoadedData] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);

  const [proposals, setProposals] = useState<Proposal[]>([]);

  // router params items
  const treasuryAddress = router.query.address as string;
  const treasuryManagerAddress = router.query.managerAddress as string;
  const description = router.query.description as string;
  const title = router.query.title as string;
  const walletId = router.query.walletId as string;
  const depositTreasuryWalletAddress = router.query
    .depositTreasuryWalletAddress as string;

  const urlObject: Treasury = {
    title,
    description,
    treasurySCAddress: treasuryAddress,
    depositTreasuryWalletAddress,
    walletId,
  };
  // console.log(urlObject);
  function openModal() {
    setIsLoading(true);
  }

  function closeModal() {
    setIsLoading(false);
  }

  //connect metamask wallet
  async function connectWallet() {
    //connect metamask account on page enter
    const { ethereum } = window;

    // Check if MetaMask is installed
    if (!ethereum) {
      return "Make sure you have MetaMask Connected!";
    }

    // Get user Metamask Ethereum wallet address
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    // Get the first account address
    const walletAddr = accounts[0];

    setCurrentWalletAddress(walletAddr);

    await hasUserJoinedTreasury();
  }

  async function hasUserJoinedTreasury() {
    const { ethereum } = window;
    console.log(currentWalletAddress);

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (
          urlObject.treasurySCAddress != undefined &&
          currentWalletAddress !== ""
        ) {
          //create contract instance
          const treasuryManagerContractInstance = new ethers.Contract(
            treasuryManagerAddress,
            treasuryManagerABI,
            signer
          );

          const isMember =
            await treasuryManagerContractInstance.hasJoinedTreasury(
              urlObject.treasurySCAddress,
              currentWalletAddress
            );

          setHasJoinedTreasury(isMember);

          await hasUserJoinedTreasury();
        }
      }
    } catch (error) {
      console.error(error);
      alert(`Error: ${error}`);
    }
  }

  async function joinTreasury() {
    try {
      setLoadedData("Joining as member ...Please wait");
      openModal();
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        //create contract instance
        const treasuryManagerContractInstance = new ethers.Contract(
          treasuryManagerAddress,
          treasuryManagerABI,
          signer
        );

        //call joinTreasury from the smart contract
        let { hash } = await treasuryManagerContractInstance.joinTreasury(
          urlObject.treasurySCAddress,
          currentWalletAddress,
          {
            gasLimit: 1200000,
          }
        );

        //wait for transaction to be mined
        await provider.waitForTransaction(hash);

        //display alert message
        alert(`Transaction sent! Hash: ${hash}`);

        //close modal
        closeModal();
      }
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
      return `${error}`;
    }
  }

  async function getProposalData() {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        if (urlObject.treasurySCAddress != undefined) {
          //create contract instance
          const treasuryManagerContractInstance = new ethers.Contract(
            treasuryManagerAddress,
            treasuryManagerABI,
            signer
          );

          const proposalAddresses =
            await treasuryManagerContractInstance.getProposals(
              urlObject.treasurySCAddress
            );
          const allProposalData =
            await treasuryManagerContractInstance.getProposalOverviewData(
              urlObject.treasurySCAddress,
              proposalAddresses
            );

          // declare new array
          let new_proposals = [];

          //iterate and loop through the data retrieve from the blockchain
          for (let i = 0; i < allProposalData.proposalDescription.length; i++) {
            let title: string = allProposalData.proposalTitle[i];
            let description: string = allProposalData.proposalDescription[i];
            let withdrawAmount: number = allProposalData.withdrawAmount[i];
            let targetWalletAddress: string = allProposalData.withdrawWallet[i];
            let status: string = allProposalData.status[i];
            let noOfYesVotes: number = allProposalData.numberOfYesVotes[i];
            let noOfNoVotes: number = allProposalData.numberOfNoVotes[i];
            let proposerAddress: string = allProposalData.proposerAddress[i]; //??
            let proposalContractAddress: string = proposalAddresses[i];

            let newProposalItem: Proposal = {
              title,
              description,
              withdrawAmount,
              targetWalletAddress,
              status,
              noOfYesVotes,
              noOfNoVotes,
              proposerAddress,
              proposalContractAddress,
            };
            new_proposals.push(newProposalItem);
          }
          setProposals(new_proposals);
          console.log(new_proposals);
        }
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  }

  async function transferUSDC() {
    //validate fields

    if (!USDCAmount) {
      return alert("USDC Amount field is empty. ");
    }

    if (
      parseFloat(USDCAmount) == null ||
      Number.isNaN(parseFloat(USDCAmount))
    ) {
      return alert("USDC Amount must be a number. ");
    }

    if (parseFloat(USDCAmount) == null || parseFloat(USDCAmount) == undefined) {
      return alert("USDC Amount must be a number. ");
    }

    // Replace with your own values
    const usdcContractAddress = "0x5425890298aed601595a70AB815c96711a31Bc65"; // USDC contract address on Avalanche testnet
    const recipientAddress = urlObject.depositTreasuryWalletAddress;

    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoadedData("Approving USDC to be spend...Please wait");
        openModal();

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        //create contract instance
        const usdcContractInstance = new ethers.Contract(
          usdcContractAddress,
          usdcABI,
          signer
        );

        // approve USDC tokens before transfer
        const approveUsdcTxn = await usdcContractInstance.approve(
          currentWalletAddress,
          ethers.utils.parseUnits(USDCAmount, 6), //amount is a placeholder, amount is set when metamask pop-up shows
          {
            gasLimit: 1200000,
          }
        );

        // Wait for the transaction to be mined
        await approveUsdcTxn.wait();
        alert(`Transaction sent! Hash: ${approveUsdcTxn.hash}`);

        closeModal();

        setLoadedData("Sending USDC...Please wait");
        openModal();

        // Transfer USDC tokens
        const usdcTransferTxn = await usdcContractInstance.transferFrom(
          currentWalletAddress,
          recipientAddress,
          ethers.utils.parseUnits(USDCAmount, 6),
          {
            gasLimit: 100000,
          }
        );

        // Wait for the transaction to be mined
        await usdcTransferTxn.wait();
        alert(`Transaction sent! Hash: ${usdcTransferTxn.hash}`);

        closeModal();
        setUSDCAmount("");
      }
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
      console.error("Error:", error);
    }
  }

  async function getUSDCBalance() {
    const apiKey = process.env.NEXT_PUBLIC_CIRCLE_API_KEY;
    // console.log(apiKey);

    try {
      if (urlObject.treasurySCAddress != undefined) {
        //call nextjs API endpoint to get wallet balance
        const getWalletBalance = await axios.post("/api/getWalletBalance", {
          apiKey: apiKey,
          walletId: urlObject.walletId,
        });

        const getWalletBalanceResponseData =
          getWalletBalance.data.responseData.data;
        // console.log(getWalletBalanceResponseData.balances);

        const USDCbalance = getWalletBalanceResponseData.balances;

        if (USDCbalance.length === 0) {
          setTreasuryUSDCBalance("0.00");
        } else {
          //todo: filter by USD currnecy
          setTreasuryUSDCBalance(`${USDCbalance[0].amount}`);
        }
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }

    //sample output reponse
    //   {
    //     "data": {
    //         "walletId": "1016283032",
    //         "entityId": "40868828-8a75-4f55-bbe1-37b4c8190a83",
    //         "type": "end_user_wallet",
    //         "description": "testing wallet",
    //         "balances": []
    //     }
    // }

    //   {
    //     "walletId": "1013946635",
    //     "entityId": "40868828-8a75-4f55-bbe1-37b4c8190a83",
    //     "type": "end_user_wallet",
    //     "description": "Lesson 7 practical",
    //     "balances": [
    //         {
    //             "amount": "1.00",
    //             "currency": "USD"
    //         }
    //     ]
    // }
  }

  const goToHomepage = () => {
    router.push({
      pathname: "/",
      //   query: { params1: "test" }, //send data to page
    });
  };

  const goToProposalDetailsPage = (proposalAddress: string) => {
    if (joinedTreasury === true) {
      router.push({
        pathname: "/proposalDetails",
        query: {
          treasuryAddress: treasuryAddress,
          treasuryManagerAddress,
          proposalAddress,
          walletId,
        }, //send data to page
      });
    } else {
      alert(`Join as a member to view proposal details`);
    }
  };

  function getColour(status: string) {
    if (status === "Voting") {
      return "black";
    } else if (status === "Success") {
      return "green";
    } else {
      return "red";
    }
  }

  const goToCreateProposalPage = (
    treasuryContractAddr: string,
    treasuryUSDCBalance: string
  ) => {
    if (treasuryUSDCBalance === "0.00") {
      alert(
        `Please fund the account with some USDC before creating a proposal.`
      );
    } else {
      router.push({
        pathname: `/createProposal`,
        query: {
          treasuryManagerAddress,
          treasuryAddress: treasuryContractAddr,
          treasuryUSDCBalance,
        },
      });
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      color: "black ",
    },
  };

  useEffect(() => {
    connectWallet();

    getUSDCBalance();
    getProposalData();
  }, [router.query, isLoading, currentWalletAddress]);

  return (
    <>
      <div className={styles.background} style={{ margin: "-10px" }}>
        <div className={styles.topPanel}>
          <div className={styles.walletAddress}>{`USDC Transfer App`}</div>
          <div className={styles.walletAddress}>
            {`Wallet Address: ${currentWalletAddress}`}
          </div>
        </div>

        {/* loading modal */}
        <Modal
          isOpen={isLoading}
          //onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {loadedData}
        </Modal>

        <div style={{ marginLeft: "100px", marginRight: "100px" }}>
          <div className={styles.myBusinessPageContainer}>
            <h2 className={styles.createBusinessAccountText}>
              <div>{`${urlObject.title}`}</div>
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: "black",
                  paddingLeft: "25px",
                  paddingTop: "10px",
                  //textAlign: "center",
                }}
              >
                {`${urlObject.description}`}
              </div>
              <div>
                <button
                  className={styles.createBusinessBtn}
                  onClick={goToHomepage}
                >
                  Back to homepage
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div className={styles.proposalSectionContainer}>
              <h2 className={styles.createBusinessAccountText}>
                <div>{`Proposals`}</div>
              </h2>
              {/* // */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    color: "black",
                    paddingLeft: "25px",
                    paddingTop: "10px",
                    //textAlign: "center",
                  }}
                >
                  {`${proposals.length} Proposals Created`}
                </div>
                <div>
                  {joinedTreasury === false ? null : (
                    <button
                      className={styles.createProposalBtn}
                      onClick={() =>
                        goToCreateProposalPage(
                          urlObject.treasurySCAddress,
                          treasuryUSDCBalance
                        )
                      }
                    >
                      New Proposal
                    </button>
                  )}
                </div>
              </div>
              <div>
                {proposals.length === 0 ? null : (
                  <>
                    <div className={styles.listProposalContainer}>
                      {proposals.map((proposal) => {
                        return (
                          <>
                            <div
                              className={styles.proposalsContainer}
                              onClick={() =>
                                goToProposalDetailsPage(
                                  proposal.proposalContractAddress
                                )
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <h2
                                  className={styles.createBusinessAccountText}
                                >
                                  <div>{proposal.title}</div>
                                </h2>
                                <div
                                  className={styles.proposalStatusText}
                                  style={{
                                    backgroundColor: getColour(proposal.status),
                                  }}
                                >
                                  {proposal.status}
                                </div>
                              </div>

                              <div
                                className={styles.nonBoldText}
                              >{`${proposal.description}`}</div>
                              <div
                                className={styles.nonBoldText}
                              >{`proposed by: ${proposal.proposerAddress}`}</div>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className={styles.balanceSectionContainer}>
                <h2 className={styles.createBusinessAccountText}>
                  <div>{`Business account balance (USDC)`}</div>
                </h2>
                <div
                  style={{
                    color: "black",
                    paddingLeft: "25px",
                    paddingTop: "10px",
                    // display: "flex",
                    // justifyContent: "space-between",
                    //textAlign: "center",
                  }}
                >
                  {`$${treasuryUSDCBalance}`}
                  <div className={styles.buttonContainer}>
                    {joinedTreasury === false ? null : (
                      <>
                        <input
                          type="text"
                          placeholder="Add USDC amount to transfer"
                          onChange={(e) => setUSDCAmount(e.target.value)}
                          value={USDCAmount}
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            display: "block",
                            backgroundColor: "white",
                            color: "black",
                            // width: "600px",
                            // marginBottom: "10px",
                          }}
                        />
                        <button
                          className={styles.fundBtn}
                          onClick={transferUSDC}
                        >
                          Fund
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.balanceSectionContainer}>
                <h2 className={styles.createBusinessAccountText}>
                  <div>{`Member`}</div>
                </h2>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {joinedTreasury === false ? (
                    <>
                      <div className={styles.nonBoldText}>{`Not a member`}</div>
                      <button className={styles.joinBtn} onClick={joinTreasury}>
                        Join
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className={styles.nonBoldText}
                      >{`Joined as Member`}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- */}
        </div>
      </div>
    </>
  );
}
