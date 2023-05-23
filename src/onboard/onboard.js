import React, { useEffect } from "react";
import { init, useConnectWallet } from "@web3-onboard/react";
import { OnboardAPI } from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import { ethers } from "ethers";
import walletConnectModule from "@web3-onboard/walletconnect";
import { useDispatch } from "react-redux";
import { saveWallet } from "../redux/action";
import { ChainId } from "@usedapp/core";
import { networkHashMap } from "../components/common/constants";
import { useSetChain } from "@web3-onboard/react";

const injected = injectedModule();
const walletConnect = walletConnectModule({
  connectFirstChainId: true,
});

// initialize Onboard
const onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: "0x19",
      token: "CRO",
      label: "Cronos Mainnet",
      rpcUrl: "https://evm.cronos.org",
    },
    {
      id: "0x152",
      token: "TCRO",
      label: "Cronos Testnet",
      rpcUrl: "https://evm-t3.cronos.org",
    },
  ],
  accountCenter: {
    mobile: { enabled: false },
    desktop: { enabled: false },
  },
  theme: "dark",
  // notify
});

export const Wallet = () => {
  const [{ connectedChain }] = useSetChain();
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const reduxDispatch = useDispatch();
  // create an ethers provider

  let ethersProvider;

  if (wallet) {
    ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
    sessionStorage.setItem(`${wallet.label}`, true);
    // console.log("wallet", wallet);
  }
  useEffect(() => {
    if (sessionStorage.getItem("MetaMask")) {
      connect({ autoSelect: { label: "metamask", disableModals: true } });
    }
    if (sessionStorage.getItem("DeFi Wallet")) {
      connect({ autoSelect: { label: "DeFi Wallet", disableModals: true } });
    }
    if (sessionStorage.getItem("WalletConnect")) {
      connect({ autoSelect: { label: "WalletConnect", disableModals: true } });
    }
  }, []);

  const walletDisconnectHandler = async () => {
    await disconnect(wallet).then(() => {
      sessionStorage.clear();
      reduxDispatch(
        saveWallet({
          id: "",
          name: "",
          role: null,
          walletAddress: "",
          wallet: null,
        })
      );
    });
  };

  const walletConnectHandler = () => {
    connect().then(() => {
      if (wallet) {
        sessionStorage.setItem(`${wallet.label}`, true);
      }
    });
  };

  const switchNetwork = async (onboard) => {
    return new Promise(async (resolve, reject) => {
      await onboard.setChain({
        chainId:
          process.env.REACT_APP_ENVIRONMENT == "DEV"
            ? ChainId.CronosTestnet
            : ChainId.Cronos,
      });
    });
  };

  return (
    <div className="nav-item ml-2">
      {wallet ? (
        (process.env.REACT_APP_ENVIRONMENT == "DEV"
          ? ChainId.CronosTestnet
          : ChainId.Cronos) !== networkHashMap[connectedChain?.id] ? (
          <li className="custom-border" onClick={() => switchNetwork(onboard)}>
            Switch Network
          </li>
        ) : (
          <li
            className="custom-border"
            disabled={connecting}
            onClick={() => {
              wallet ? walletDisconnectHandler() : walletConnectHandler();
            }}
          >
            {connecting
              ? "connecting"
              : `${wallet?.accounts[0]?.address.substring(
                  0,
                  5
                )}...${wallet?.accounts[0]?.address.substring(
                  39,
                  42
                )} | Disconnect`}
          </li>
        )
      ) : (
        <li
          className="custom-border"
          disabled={connecting}
          onClick={() => {
            wallet ? walletDisconnectHandler() : walletConnectHandler();
          }}
        >
          {"Connect Wallet"}
        </li>
      )}
    </div>
  );
};
