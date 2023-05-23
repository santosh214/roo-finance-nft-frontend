import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import Web3 from "web3";
import abi from "../../abi/contractABI.json";
import { getMultipleNfts } from "../../graphql/collections/collectionQueries";
import StakedNftCards from "../Cards/StakedNftCards";
import { useConnectWallet } from "@web3-onboard/react";
import { Box, Container, Grid, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

const StakingPoolInventoryModal = ({
  renderData,
  handleWithdraw,
  isLoading,
  setIsLoading,
  handleClose,
}) => {
  const [nftData, setNftData] = useState(null);
  const [stakedNfts, setStakedNfts] = useState(null);
  const [selectedNfts, setSelectedNfts] = useState([]);
  const [stakedNftIds, setStakedNftIds] = useState([]);
  const [batchNumber, setBatchNumber] = useState(1);
  const [checked, setChecked] = useState(false);

  const [GetMultipleNfts] = useLazyQuery(getMultipleNfts, {
    fetchPolicy: "network-only",
  });

  const { contract_address, collection_address } = renderData;
  // const { account } = useEthers();

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  // console.log("object connecting", connecting);
  const getStakedNftIds = async () => {
    const web3 = new Web3(wallet?.provider);
    const contractInstance = new web3.eth.Contract(abi);
    contractInstance.options.address = contract_address?.toLowerCase();
    await contractInstance.methods
      .getUserStakedIds(collection_address, wallet?.accounts[0]?.address)
      .call()
      .then((data) => {
        if (!data.length) {
          setIsLoading(false);
        }
        console.log("data", data);
        setStakedNfts(data);
      })
      .catch((err) => {
        console.log("error=======>", err);
      });
  };

  const selectMultipleHandler = () => {
    console.log("check");
    setChecked(!checked);
  };

  useEffect(() => {
    if (checked) {
      const arr = nftData.map((item) => {
        return item.token_id;
      });
      // console.log("arr", arr.slice(0, 20));
      setSelectedNfts(arr.slice(0, 20));
    } else {
      setSelectedNfts([]);
    }
  }, [checked]);

  useEffect(() => {
    getStakedNftIds();
  }, [renderData]);

  useEffect(() => {
    if (stakedNfts && stakedNfts.length) {
      // const smallerArrays = [];

      for (let i = 0; i < stakedNfts.length; i += 25) {
        const smallerArray = stakedNfts.slice(i, i + 25);
        stakedNftIds.push(smallerArray);
      }
      console.log("stakedNftIds", stakedNftIds);
      GetMultipleNfts({
        variables: {
          address: collection_address,
          tokens: stakedNftIds[0],
        },

        onCompleted: (data) => {
          console.log("stakednftsdata===", data);
          setNftData(data.GetMultiNfts);
        },
      });
    }
  }, [stakedNfts]);

  const loadMoreNfts = () => {
    setBatchNumber(batchNumber + 1);
    if (stakedNftIds.length > 1) {
      GetMultipleNfts({
        variables: {
          address: collection_address,
          tokens: stakedNftIds[batchNumber],
        },

        onCompleted: (data) => {
          console.log("stakednftsdata===", data);
          setNftData([...nftData, ...data.GetMultiNfts]);
        },
      });
    }
  };

  useEffect(() => {
    console.log("selectedNfts", selectedNfts);
  }, [selectedNfts]);

  useEffect(() => {
    console.log("stakedNftIds", stakedNftIds);
  }, [stakedNftIds]);

  useEffect(() => {
    console.log("batchNumber", batchNumber);
  }, [batchNumber]);

  const cardSelectHandle = (tokenId) => {
    if (!selectedNfts.includes(tokenId)) {
      setSelectedNfts([...selectedNfts, tokenId]);
    } else {
      const filter = selectedNfts.filter((id) => {
        return id != tokenId;
      });
      setSelectedNfts(filter);
    }
  };

  useEffect(() => {
    if (selectedNfts.length > 20) {
      setSelectedNfts(selectedNfts.slice(0, 20));
    }
  }, [selectedNfts]);

  const confirmWithdraw = (selectedNfts) => {
    console.log("Withdraw-------", selectedNfts);

    handleWithdraw(selectedNfts);
    setIsLoading(true);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: 350, sm: 690, md: 1000 },
    bgcolor: "#16182d",
    // border: "2px solid #000",
    // boxShadow: 24,
    p: "35px 25px 25px",
    borderRadius: "15px",
  };
  const closeHandler = () => {
    handleClose();
  };

  return (
    <>
      <Box sx={style}>
        <Box sx={{ position: "relative" }}>
          <CloseIcon
            sx={{
              position: "absolute",
              top: "-53px",
              right: "-20px",
              color: "#ffffff",
              zIndex: "999999",
              cursor: "pointer",
              fontSize: { xs: "45px", md: "45px" },
              pr: "15px",
            }}
            onClick={closeHandler}
          />
          <Container>
            <Box sx={{ flexGrow: 1 }}>
              <Grid
                container
                spacing={2}
                sx={{
                  marginTop: "30px",
                  maxHeight: { xs: "400px", sm: "430px", md: "350px" },
                  minHeight: "85px",
                  overflowY: "auto",
                  paddingRight: "15px",
                }}
              >
                {!stakedNfts && !nftData && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </Grid>
                )}
                {nftData &&
                  nftData.map((item, idx) => {
                    return (
                      <Grid
                        key={`pdt_${idx}`}
                        xs={12}
                        sm={6}
                        md={3}
                        lg={3}
                        sx={{ pl: "16px" }}
                        // onClick={() => cardSelectHandle(item.token_id)}
                      >
                        <StakedNftCards
                          item={item}
                          cardSelectHandle={cardSelectHandle}
                          selectedNfts={selectedNfts}
                        />
                      </Grid>
                    );
                  })}
                {stakedNfts && !stakedNfts.length && (
                  <Box
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    <Typography component={"span"}>No NFT Staked!</Typography>
                  </Box>
                )}
              </Grid>
              {stakedNftIds.length > 1 &&
                stakedNfts?.length != nftData?.length && (
                  <button className="btn input-btn mt-2" onClick={loadMoreNfts}>
                    Load More
                  </button>
                )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box className="stake_popup_btn text-center mt-4">
                    {nftData && nftData.length > 0 && (
                      <Box sx={{ display: "flex" }}>
                        <Typography
                          component={"input"}
                          type={"checkbox"}
                          onChange={selectMultipleHandler}
                          checked={checked}
                        />
                        <Typography component={"p"} sx={{ ml: "5px" }}>
                          Select max NFTs
                        </Typography>
                      </Box>
                    )}
                    {selectedNfts.length == 20 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                      >
                        <Typography component={"span"}>
                          Cannot select more than 20 NFTs!
                        </Typography>
                      </Box>
                    )}
                    <button
                      className="btn input-btn mt-2"
                      onClick={() => confirmWithdraw(selectedNfts)}
                      disabled={!selectedNfts.length}
                    >
                      {isLoading ? (
                        <div className="col-12 text-center">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden"></span>
                          </div>
                        </div>
                      ) : (
                        "Withdraw"
                      )}
                    </button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default StakingPoolInventoryModal;
