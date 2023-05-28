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

export default function Home() {
  const router = useRouter();

  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [currentBalance, setCurrentBalance] = useState<string>("");

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
    // Get account balance
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(walletAddr);
    const balanceAvax = ethers.utils.formatEther(balance);
    // Set to variable to store account balance
    setCurrentBalance(balanceAvax);
    //set to variable to store current wallet address
    setCurrentWalletAddress(walletAddr);
  }

  const goToHomepage = () => {
    router.push({
      pathname: "/",
      //   query: { params1: "test" }, //send data to page
    });
  };

  const goToCreateProposalPage = () => {
    router.push({
      pathname: "/createProposal",
    });
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
              <div>{`My Sample Business Account`}</div>
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
                {`Dummy Description.....`}
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
                  {`0 Proposals Created`}
                </div>
                <div>
                  <button
                    className={styles.createProposalBtn}
                    onClick={goToCreateProposalPage}
                  >
                    New Proposal
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.balanceSectionContainer}>
              <h2 className={styles.createBusinessAccountText}>
                <div>{`Balance (AVAX)`}</div>
              </h2>
              <div
                style={{
                  color: "black",
                  paddingLeft: "25px",
                  paddingTop: "10px",
                  //textAlign: "center",
                }}
              >
                {`${currentBalance}`}
              </div>
              <div className={styles.buttonContainer}></div>
            </div>
          </div>

          {/* ---- */}
        </div>
      </div>
    </>
  );
}
