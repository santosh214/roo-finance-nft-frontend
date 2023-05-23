import React, { useEffect, useState } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useEthers, ChainId } from "@usedapp/core";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
// importing MyRouts where we located all of our theme
import MyRouts from "./routers/routes";
import { useLazyQuery, useMutation } from "@apollo/client";
import { getUsers } from "./graphql/users/userQueries";
import { checkUser } from "./graphql/users/userMutations";
import { useDispatch } from "react-redux";
import { saveWallet } from "./redux/action";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ModalMenu from "./components/Modal/ModalMenu";
import { networkHashMap } from "./components/common/constants";
import Moralis from "moralis";
import "bootstrap/dist/js/bootstrap.js";


function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ connectedChain, chains }] = useSetChain();
  const { activate, chainId } = useEthers();

  const reduxDispatch = useDispatch();
  const [CheckUser] = useMutation(checkUser);

  useEffect(async() => {
     await Moralis.start({
      apiKey: process.env.REACT_APP_MORALIS_KEY
    });
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });

  useEffect(() => {
    const checkWalletConnectSession = async () => {
      if (window.sessionStorage.walletconnect) {
        connect({
          autoSelect: { label: "walletConnect", disableModals: true },
        });
        const provider = new WalletConnectProvider({
          qrcode: true,
          bridge: "https://bridge.walletconnect.org",
          rpc: {
            [process.env.REACT_APP_ENVIRONMENT == "DEV"
              ? ChainId.CronosTestnet
              : ChainId.Cronos]:
              process.env.REACT_APP_ENVIRONMENT == "DEV"
                ? process.env.REACT_APP_CRONOS_TESTNET_RPC
                : process.env.REACT_APP_CRONOS_RPC,
          },
          chainId:
            process.env.REACT_APP_ENVIRONMENT == "DEV"
              ? ChainId.CronosTestnet
              : ChainId.Cronos,
        });
        await provider.enable();
        await activate(provider);
      }
    };

    checkWalletConnectSession().then(async () => {
      if (wallet?.accounts[0]?.address) {
        await CheckUser({
          variables: {
            payload: {
              wallet: wallet?.accounts[0]?.address,
            },
          },
          onCompleted: (data) => {
            reduxDispatch(
              saveWallet({
                role: data.checkUser.role,
                walletAddress: data.checkUser.wallet,
                wallet: wallet,
              })
            );
          },
        });
      }
    });
    if (
      wallet &&
      ChainId &&
      (process.env.REACT_APP_ENVIRONMENT == "DEV"
        ? ChainId.CronosTestnet
        : ChainId.Cronos) !== networkHashMap[connectedChain?.id]
    ) {
      toast.error(
        process.env.REACT_APP_ENVIRONMENT == "DEV"
          ? "Connect to Cronos testnet Chain and refresh page"
          : "Connect to Cronos Chain and refresh page",
        {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
  }, [wallet?.accounts[0]?.address]);
  return (
    <div>
      <Header />
      <ToastContainer />
      <MyRouts />
      <ModalMenu />
      <Footer />
    </div>
  );
}

export default App;
