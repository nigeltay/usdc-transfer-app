"use client";
import Image from "next/image";
import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/Home.module.css";

//ABIs
import treasuryManagerABI from "../../utils/treasuryManagerABI.json";

export type Treasury = {
  title: string;
  description: string;
  treasurySCAddress: string;
  depositTreasuryWalletAddress: string;
  walletId: string;
};

export default function Home() {
  const treasuryContractAddress = "0x70Fd5e496D0Eb0F3437B658Fa1a66D6BD458C5AA"; //TODO: put into env file
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");

  const [treasuries, setTreasuries] = useState<Treasury[]>([]);

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

  async function getAllTreasuries() {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      //create contract instance
      const treasuryManagerContractInstance = new ethers.Contract(
        treasuryContractAddress,
        treasuryManagerABI,
        signer
      );

      // call getTreasuries function to get all the treasuries contract addresses
      const allTreasuriesAddresses =
        await treasuryManagerContractInstance.getTreasuries();

      //call getTreasuriesData function to get all data of each treasury
      const allTreasuries =
        await treasuryManagerContractInstance.getTreasuriesData(
          allTreasuriesAddresses
        );

      // declare new array
      let new_treasuries = [];

      //iterate and loop through the data retrieve from the blockchain
      for (let i = 0; i < allTreasuries.description.length; i++) {
        let title: string = allTreasuries.title[i];
        let description: string = allTreasuries.description[i];
        let treasurySCAddress: string = allTreasuriesAddresses[i];
        let depositTreasuryWalletAddress: string =
          allTreasuries.depositAddress[i];
        let walletId: string = allTreasuries.walletID[i];

        let newItem: Treasury = {
          title,
          description,
          treasurySCAddress,
          depositTreasuryWalletAddress,
          walletId,
        };
        new_treasuries.push(newItem);
      }

      setTreasuries(new_treasuries);
      console.log(new_treasuries);
    }
  }

  useEffect(() => {
    connectWallet();
    getAllTreasuries();
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
              <Link href={`/createBusiness?address=${treasuryContractAddress}`}>
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
            {treasuries.length === 0 ? (
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
                {treasuries.map((treasury) => {
                  return (
                    <>
                      <div className={styles.homePageContainers}>
                        <h2 className={styles.createBusinessAccountText}>
                          <div>{`${treasury.title}`}</div>
                        </h2>
                        <div
                          style={{
                            color: "black",
                            paddingLeft: "25px",
                            paddingTop: "10px",
                            //textAlign: "center",
                          }}
                        >
                          {`${treasury.description}`}
                        </div>
                        <div className={styles.homePageButtonContainer}>
                          <Link
                            href={`/myBusiness?address=${treasury.treasurySCAddress}&description=${treasury.description}&title=${treasury.title}&depositTreasuryWalletAddress=${treasury.depositTreasuryWalletAddress}&walletId=${treasury.walletId}`}
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

          {/* <div className={styles.homePageContainers}>
            <h2 className={styles.createBusinessAccountText}>
              <div>{`Business Account 1`}</div>
            </h2>
            <div
              style={{
                color: "black",
                paddingLeft: "25px",
                paddingTop: "10px",
                //textAlign: "center",
              }}
            >
              {`Transfer USDC to this account for funding.`}
            </div>
            <div className={styles.homePageButtonContainer}>
              <Link href={`/myBusiness?param1=value1`}>
                <button className={styles.goToCreateBusinessPageBtn}>
                  View
                </button>
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
