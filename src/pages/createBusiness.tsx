import Image from "next/image";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/Home.module.css";
// import globalStyles from "../../styles/"

export default function Home() {
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");
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
    // Navigate to the desired page on button click
    // You can replace "/otherpage" with the path of the page you want to navigate to
    window.location.href = "/";
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          minWidth: "500px",
          margin: "-10px",
          minHeight: "950px",
        }}
      >
        <div className={styles.topPanel}>
          <div className={styles.walletAddress}>{`USDC Transfer App`}</div>
          <div className={styles.walletAddress}>
            {`Wallet Address: ${currentWalletAddress}`}
          </div>
        </div>

        <div>
          <h2 className={styles.createBusinessAccountText}>
            <div>{`Create Business Account`}</div>
          </h2>

          <div style={{ marginTop: "20px", marginLeft: "25px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label>Add Circle API Key</label>
            </div>

            <input
              type="text"
              placeholder="Enter text here"
              // onChange={(e) => setCommentText(e.target.value)}
              // value={commentText}
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
              <button className={styles.createBusinessBtn}>
                Create Business
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
