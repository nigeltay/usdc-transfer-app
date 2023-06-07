"use client";
import Image from "next/image";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/Home.module.css";

//ABIs
import accountManagerABI from "../../utils/accountManagerABI.json";

export type Account = {
  title: string;
  description: string;
  accountSCAddress: string;
  depositAccountWalletAddress: string;
  walletId: string;
};

export default function Home() {
  const accountManagerContractAddress =
    process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");

  const [accounts, setAccounts] = useState<Account[]>([]);

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

    await getAllAccounts();
  }

  async function getAllAccounts() {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      //(1)Create Account Manager contract instance

      //(2) call getAccounts function to get all the accounts contract addresses

      //(3) call getAccountsData function to get all data of each account

      // declare new array
      let new_accounts = [];

      //(4) set accounts items to state variable
    }
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <>
      <Head>
        <title>USDC Transfer App</title>

        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images.png" />
      </Head>

      <div className={styles.background}>
        <div className={styles.topPanel}>
          <div className={styles.walletAddress}>{`USDC Transfer App`}</div>
          <div className={styles.walletAddress}>
            {`Wallet Address: ${currentWalletAddress}`}
          </div>
        </div>

        <div style={{ marginLeft: "100px", marginRight: "100px" }}>
          {/* create business account */}

          <div className={styles.homePageContainers}>
            <div className={styles.imageContainer}>
              <Image
                src="/images/business.png"
                alt="Business Image"
                width={100}
                height={100}
              />
            </div>

            <h2 className={styles.createBusinessAccountText}>
              <div>{`Create Business Account`}</div>
            </h2>
            <div
              style={{
                color: "black",
                paddingLeft: "25px",
                paddingTop: "10px",
                paddingRight: "10px",
                //textAlign: "center",
              }}
            >
              {`Creates an account for members of the
            business to make contributions.`}
            </div>
            <div className={styles.homePageButtonContainer}>
              <Link
                href={`/createBusiness?address=${accountManagerContractAddress}`}
              >
                <button className={styles.goToCreateBusinessPageBtn}>
                  Create
                </button>
              </Link>
            </div>
          </div>

          <div style={{ color: "black", padding: "10px" }}>
            Explore Accounts
          </div>

          <div>
            {accounts.length === 0 ? (
              <div className={styles.homePageEmptyContainer}>
                <h2
                  className={styles.createBusinessAccountText}
                  style={{ textAlign: "center" }}
                >
                  <div>{`No Business Account created`}</div>
                </h2>
                <div
                  style={{
                    color: "black",
                    paddingLeft: "25px",
                    paddingTop: "10px",
                    textAlign: "center",
                  }}
                >
                  {`Create 1 by clicking on Create button above`}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {accounts.map((account) => {
                  return (
                    <>
                      <div className={styles.homePageContainers}>
                        <h2 className={styles.createBusinessAccountText}>
                          <div>{`${account.title}`}</div>
                        </h2>
                        <div
                          style={{
                            color: "black",
                            paddingLeft: "25px",
                            paddingTop: "10px",
                            //textAlign: "center",
                          }}
                        >
                          {`${account.description}`}
                        </div>
                        <div className={styles.homePageButtonContainer}>
                          <Link
                            href={`/myBusiness?managerAddress=${accountManagerContractAddress}&address=${account.accountSCAddress}&description=${account.description}&title=${account.title}&depositAccountWalletAddress=${account.depositAccountWalletAddress}&walletId=${account.walletId}`}
                          >
                            <button
                              className={styles.goToCreateBusinessPageBtn}
                            >
                              View
                            </button>
                          </Link>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
