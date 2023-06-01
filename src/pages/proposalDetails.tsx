import Modal from "react-modal";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import axios from "axios";
import { useRouter } from "next/router";
import { Proposal } from "./myBusiness";
//ABIs
import treasuryManagerABI from "../../utils/treasuryManagerABI.json";
import withdrawProposalABI from "../../utils/withdrawProposalABI.json";

export default function Home() {
  const router = useRouter();

  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");

  const [loadedData, setLoadedData] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);

  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [proposalData, setProposalData] = useState<Proposal>({
    title: "",
    description: "",
    withdrawAmount: 0,
    targetWalletAddress: "",
    status: "",
    noOfYesVotes: 0,
    noOfNoVotes: 0,
    proposerAddress: "",
    proposalContractAddress: "",
  });

  // router params items
  const treasurySCAddress = router.query.treasuryAddress as string;
  const treasuryManagerAddress = router.query.treasuryManagerAddress as string;
  const proposalSCAddress = router.query.proposalAddress as string;
  const walletId = router.query.walletId as string;

  function openModal() {
    setIsLoading(true);
  }

  function closeModal() {
    setIsLoading(false);
  }

  function getColour(status: string) {
    if (status === "Voting") {
      return "black";
    } else if (status === "Success") {
      return "green";
    } else {
      return "red";
    }
  }

  const goToHomepage = () => {
    router.push({
      pathname: "/",
    });
  };

  const goBack = () => {
    router.back();
  };

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

    await getCurrentProposalData();
    await checkIfUserVoted();
  }

  async function getCurrentProposalData() {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (
          treasurySCAddress != undefined &&
          treasuryManagerAddress != undefined &&
          proposalSCAddress != undefined
        ) {
          //create contract instance
          const treasuryManagerContractInstance = new ethers.Contract(
            treasuryManagerAddress,
            treasuryManagerABI,
            signer
          );

          const allProposalData =
            await treasuryManagerContractInstance.getProposalOverviewData(
              treasurySCAddress,
              [proposalSCAddress]
            );

          let newProposalItem: Proposal = {
            title: allProposalData.proposalTitle[0],
            description: allProposalData.proposalDescription[0],
            withdrawAmount: parseFloat(
              ethers.utils.formatUnits(allProposalData.withdrawAmount[0], 6)
            ),
            targetWalletAddress: allProposalData.withdrawWallet[0],
            status: allProposalData.status[0],
            noOfYesVotes: parseInt(
              ethers.utils.formatUnits(allProposalData.numberOfYesVotes[0], 0)
            ),
            noOfNoVotes: parseInt(
              ethers.utils.formatUnits(allProposalData.numberOfNoVotes[0], 0)
            ),
            proposerAddress: allProposalData.proposerAddress[0],
            proposalContractAddress: proposalSCAddress,
          };

          //set
          setProposalData(newProposalItem);
        }
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  }

  async function checkIfUserVoted() {
    const { ethereum } = window;

    try {
      if (ethereum) {
        if (
          treasurySCAddress != undefined &&
          treasuryManagerAddress != undefined &&
          proposalSCAddress != undefined &&
          currentWalletAddress !== ""
        ) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();

          //create treasury manaager contract instance
          const treasuryManagerContractInstance = new ethers.Contract(
            treasuryManagerAddress,
            treasuryManagerABI,
            signer
          );

          //call hasVoted function from the contract
          const hasUserVoted = await treasuryManagerContractInstance.hasVoted(
            treasurySCAddress,
            proposalSCAddress,
            currentWalletAddress
          );

          setHasVoted(hasUserVoted);
        }
      }
    } catch (error) {
      alert(`Error : ${error}`);
    }
  }

  async function vote(decision: boolean) {
    const { ethereum } = window;

    try {
      if (ethereum) {
        setLoadedData("Voting...Please wait");
        openModal();

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        // create treasury manager contract instance
        const treasuryManagerContractInstance = new ethers.Contract(
          treasuryManagerAddress,
          treasuryManagerABI,
          signer
        );

        //(13) Call voteOnWithdrawProposal function from the contract

        //(14) wait for transaction to finish

        closeModal();

        // create contract instance
        const withdrawProposalContractInstance = new ethers.Contract(
          proposalSCAddress,
          withdrawProposalABI,
          signer
        );
        //call getStatus function from withdrawProposal contract
        const status = await withdrawProposalContractInstance.getStatus();

        if (status === "Success") {
          alert(
            "There are 2 Yes votes in the proposal...Initiating transfer of USDC from business account to target wallet address. Click Ok to continue."
          );
          setLoadedData("Sending USDC over... please wait");
          openModal();
          const apiKey = process.env.NEXT_PUBLIC_CIRCLE_API_KEY;

          try {
            //call nextjs API endpoint to trasnfer USDC
            const createUSDCTransfer = await axios.post("/api/createTransfer", {
              apiKey: apiKey,
              walletId: walletId,
              amount: proposalData.withdrawAmount.toString(), //convert to string
              targetAddress: proposalData.targetWalletAddress,
            });

            //response data of API call
            const createUSDCTransferResponseData =
              createUSDCTransfer.data.responseData.data;

            console.log(createUSDCTransferResponseData);

            alert(`USDC has been transferred successfully!`);
            closeModal();
          } catch (error) {
            alert(`Error: ${error}`);
            closeModal();
          }
        }

        closeModal();
      }
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
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
          <div className={styles.proposalDetailsPageContainer}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2 className={styles.createBusinessAccountText}>
                <div>{`${proposalData.title}`}</div>
              </h2>
              <div
                className={styles.proposalStatusText}
                style={{
                  fontSize: "0.8em",
                  backgroundColor: getColour(proposalData.status),
                  color: "white",
                }}
              >
                {` ${proposalData.status}`}
              </div>
            </div>

            <div className={styles.normalText}>
              {`Description: ${proposalData.description}`}
            </div>
            <div className={styles.normalText} style={{ fontSize: "0.8em" }}>
              {`Proposed By: ${proposalData.proposerAddress}`}
            </div>
          </div>

          <div className={styles.proposalDetailsPageContainer}>
            <h2 className={styles.createBusinessAccountText}>
              <div>{`Details`}</div>
            </h2>
            <div className={styles.normalText}>
              {`Withdraw Amount: ${proposalData.withdrawAmount} USDC`}
            </div>
            <div style={{ display: "flex" }}>
              <div className={styles.normalText}>{`Transfer to:`}</div>

              <div className={styles.hyperlinkText}>
                <Link
                  href={`https://testnet.snowtrace.io/address/${proposalData.targetWalletAddress}#tokentxns`}
                  target="_blank"
                >
                  {proposalData.targetWalletAddress}
                </Link>
              </div>
            </div>

            <h2 className={styles.createBusinessAccountText}>
              <div>{`Voting Results`}</div>
            </h2>

            <div className={styles.normalText}>
              {`Number of Yes : ${proposalData.noOfYesVotes}`}
            </div>

            <div className={styles.normalText}>
              {`Number of No: ${proposalData.noOfNoVotes}`}
            </div>
          </div>
          <div>
            {hasVoted == false &&
            currentWalletAddress.toLowerCase() !==
              proposalData.proposerAddress.toLowerCase() &&
            proposalData.status == "Voting" ? (
              <div className={styles.proposalDetailsPageContainer}>
                <h2 className={styles.createBusinessAccountText}>
                  <div>{`Place your Votes`}</div>
                </h2>

                <div style={{ paddingLeft: "10px" }}>
                  <button
                    className={styles.voteBtn}
                    style={{ backgroundColor: "green" }}
                    onClick={() => vote(true)}
                  >
                    Vote Yes
                  </button>

                  <button
                    className={styles.voteBtn}
                    style={{ backgroundColor: "red" }}
                    onClick={() => vote(false)}
                  >
                    Vote No
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <button
            className={styles.voteBtn}
            style={{ backgroundColor: "blue", width: "200px" }}
            onClick={() => goBack()}
          >
            Back to Account page
          </button>
          <button
            className={styles.voteBtn}
            style={{ backgroundColor: "black" }}
            onClick={() => goToHomepage()}
          >
            Back to home
          </button>
        </div>
      </div>
    </>
  );
}
