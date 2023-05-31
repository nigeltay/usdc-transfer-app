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

//ABIs
import treasuryManagerABI from "../../utils/treasuryManagerABI.json";

export default function Home() {
  const router = useRouter();

  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");

  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [targetWalletAddress, setTargetWalletAddress] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  const [loadedData, setLoadedData] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);

  //router query items
  const treasurySCAddress = router.query.treasuryAddress as string;
  const treasuryUSDCBalance = router.query.treasuryUSDCBalance as string;
  const treasuryManagerAddress = router.query.treasuryManagerAddress as string;

  function openModal() {
    setIsLoading(true);
  }

  function closeModal() {
    setIsLoading(false);
  }
  const goToHomepage = () => {
    router.push({
      pathname: "/",
      //   query: { params1: "test" }, //send data to page
    });
  };

  const goBack = () => {
    router.back();
  };

  //connect metamask wallet
  async function connectWallet() {
    //get value from url query
    // console.log(router.query);

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
    //set to variable to store current wallet address
    setCurrentWalletAddress(walletAddr);
  }

  async function createProposal() {
    //TODO: check if balance of treasury <= to withdraw amount
    const businessAccountUSDCAmount = parseFloat(treasuryUSDCBalance);

    //validate field
    if (!title) {
      return alert("Title field is empty. ");
    }

    if (!description) {
      return alert("Description field is empty. ");
    }

    if (!targetWalletAddress) {
      return alert("Target Wallet Address field is empty. ");
    }

    if (!withdrawAmount) {
      return alert("USDC Amount is empty. ");
    }

    if (
      parseFloat(withdrawAmount) == null ||
      Number.isNaN(parseFloat(withdrawAmount))
    ) {
      return alert("USDC Amount must be a number. ");
    }

    if (parseFloat(withdrawAmount) > businessAccountUSDCAmount) {
      return alert(
        "USDC Amount cannot exceed your business account balance.  "
      );
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        setLoadedData("Creating Proposal...Please wait");
        openModal();

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        //create contract instance
        const treasuryManagerContractInstance = new ethers.Contract(
          treasuryManagerAddress,
          treasuryManagerABI,
          signer
        );

        //call createWithdrawProposal from the smart contract
        let { hash } =
          await treasuryManagerContractInstance.createWithdrawProposal(
            treasurySCAddress,
            title,
            description,
            ethers.utils.parseUnits(withdrawAmount, 6),
            targetWalletAddress,
            currentWalletAddress,
            {
              gasLimit: 2000000,
            }
          );

        //wait for transaction to be mined
        await provider.waitForTransaction(hash);

        //display alert message
        alert(`Transaction sent! Hash: ${hash}`);

        //close modal
        closeModal();

        //clear fields
        setDescription("");
        setTitle("");
        setWithdrawAmount("");
        setTargetWalletAddress("");

        //redirect back to previous page
        goBack();
      }
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
      console.error("Error:", error);
    }
  }

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
  }, []);

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
              <div>{`Create a Proposal`}</div>
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
                {`Provide Information that voters will need to know.`}
              </div>
            </div>
          </div>

          <div className={styles.createProposalContainer}>
            <h2 className={styles.createBusinessAccountText}>
              <div>{`Proposal Details`}</div>
            </h2>
            {/* // */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginTop: "20px", marginLeft: "25px" }}>
                <div style={{ marginBottom: "10px" }}>
                  <label>Proposal Title</label>
                </div>

                <input
                  type="text"
                  placeholder="Add Proposal title here"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    display: "block",
                    backgroundColor: "white",
                    color: "black",
                    width: "600px",
                    marginBottom: "10px",
                  }}
                />

                <div style={{ marginBottom: "10px" }}>
                  <label>Proposal Description</label>
                </div>

                <input
                  type="text"
                  placeholder="Enter your description here"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    display: "block",
                    backgroundColor: "white",
                    color: "black",
                    width: "600px",
                    marginBottom: "10px",
                  }}
                />

                <div style={{ marginBottom: "10px" }}>
                  <label>Target wallet Address</label>
                </div>

                <input
                  type="text"
                  placeholder="Enter target wallet address"
                  onChange={(e) => setTargetWalletAddress(e.target.value)}
                  value={targetWalletAddress}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    display: "block",
                    backgroundColor: "white",
                    color: "black",
                    width: "600px",
                    marginBottom: "10px",
                  }}
                />

                <div style={{ marginBottom: "10px" }}>
                  <label>Withdraw Amount</label>
                </div>

                <input
                  type="text"
                  placeholder="Enter withdraw amount"
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  value={withdrawAmount}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    display: "block",
                    backgroundColor: "white",
                    color: "black",
                    width: "600px",
                    marginBottom: "10px",
                  }}
                />

                <button className={styles.backBtn} onClick={createProposal}>
                  Create Proposal
                </button>

                <button className={styles.backBtn} onClick={goBack}>
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* ---- */}
        </div>
      </div>
    </>
  );
}
