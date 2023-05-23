import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ChainId, DAppProvider } from "@usedapp/core";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { Provider } from "react-redux";
import store from "./redux/store";

require("dotenv").config();

const config = {
  pollingInterval: 5000,
  autoConnect: true,
  readOnlyChainId:
    process.env.REACT_APP_ENVIRONMENT == "DEV"
      ? ChainId.CronosTestnet
      : ChainId.Cronos,
  readOnlyUrls: {
    [process.env.REACT_APP_ENVIRONMENT == "DEV"
      ? ChainId.CronosTestnet
      : ChainId.Cronos]:
      process.env.REACT_APP_ENVIRONMENT == "DEV"
        ? process.env.REACT_APP_CRONOS_TESTNET_RPC
        : process.env.REACT_APP_CRONOS_RPC,
  },
};

const client = new ApolloClient({
  uri: process.env.REACT_APP_APOLLO_CLIENT_URI,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Provider store={store}>
        <BrowserRouter>
          <DAppProvider config={config}>
            <App />
          </DAppProvider>
        </BrowserRouter>
      </Provider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
