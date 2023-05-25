import Image from "next/image";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/Home.module.css";
// import uuid from "uuid-random";
import axios from "axios";

export default function Home() {
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [walletDescription, setWalletDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const [loadedData, setLoadedData] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);

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
    //set to variable to store current wallet address
    setCurrentWalletAddress(walletAddr);
  }

  const goToHomepage = () => {
    window.location.href = "/";
  };

  async function createBusiness() {
    try {
      //validate fields
      if (!walletDescription) {
        return alert("Wallet description field is empty. ");
      }

      if (!apiKey) {
        return alert("API key field is empty.");
      }

      //call createWallet endpoint
      const createWallet = await axios.post("/api/createWallet", {
        apiKey: apiKey,
        description: walletDescription,
      });
      const createWalletResponseData = createWallet.data.responseData.data;
      console.log(createWalletResponseData);

      //sample output response
      // {
      //   "walletId": "1016266156",
      //   "entityId": "40868828-8a75-4f55-bbe1-37b4c8190a83",
      //   "type": "end_user_wallet",
      //   "description": "Business Wallet",
      //   "balances": []
      // }

      //get wallet Id to create blockchain address for that wallet

      const newWalletId = createWalletResponseData.walletId;

      //call createBlockchainAddress endpoint
      // WIP
    } catch (error: any) {
      //e.g. { code: 401, message: "Invalid credentials." }
      console.log(error.response.data.error);

      alert(
        `Error:${error.response.data.error.code} ${error.response.data.error.message}`
      );
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

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "15px",
            margin: "20px",
          }}
        >
          <h2 className={styles.createBusinessAccountText}>
            <div>{`Create Business Account`}</div>
          </h2>
          <div style={{ margin: "25px", paddingBottom: "20px" }}>
            Name and define your Business account details here. All Information
            will be displayed on the explore section of the homepage once
            account is created.
          </div>
        </div>

        <div
          style={{
            backgroundColor: "whitesmoke",
            // marginLeft: "100px",
            // marginRight: "100px",
            borderRadius: "15px",
            margin: "20px",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <div style={{ marginTop: "20px", marginLeft: "25px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label>Add Circle API Key</label>
            </div>

            <input
              type="text"
              placeholder="Enter your API Key here"
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
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
              <label>Wallet Description</label>
            </div>

            <input
              type="text"
              placeholder="Add Your description here"
              onChange={(e) => setWalletDescription(e.target.value)}
              value={walletDescription}
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
              <label>Title</label>
            </div>

            <input
              type="text"
              placeholder="Add Your title here"
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

            <div className={styles.buttonContainer}>
              <button
                className={styles.createBusinessBtn}
                onClick={createBusiness}
              >
                Create
              </button>
            </div>

            <button className={styles.backBtn} onClick={goToHomepage}>
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
