import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { getNfts } from '../../graphql/users/userQueries';
import { useEthers } from '@usedapp/core';
import NftCard from '../Cards/NftCard';
import { useConnectWallet } from '@web3-onboard/react';
import { Box, Container, Divider, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import Moralis from 'moralis';
import BoostNftCard from '../Cards/BoostNftCard';
const NftInventoryModal = ({
  renderData,
  handleStake,
  isLoading,
  setIsLoading,
  handleClose,
}) => {
  // console.log('🚀 ~ renderData', renderData);
  const [nftData, setNftData] = useState(null);
  const [boostNftData, setBoostNftData] = useState(null);
  const [selectedNfts, setSelectedNfts] = useState([]);
  const [selectedBoostNft,setSelectedBoostNft]=useState([])
  const [checked, setChecked] = useState(false);

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const [GetNfts] = useLazyQuery(getNfts, {
    fetchPolicy: 'network-only',
  });

  const confirmStake = (selectedNfts,selectedBoostnft) => {
    // console.log('stake-------', selectedNfts,selectedBoostnft);
    setIsLoading(true);
    handleStake(selectedNfts,selectedBoostnft);
  };

  const selectMultipleHandler = () => {
    // console.log('check');
    setChecked(!checked);
  };

  useEffect(() => {
    if (checked) {
      // console.log("🚀 ~ useEffect ~ checked", checked)
      const arr = nftData.map((item) => {
        return item.tokenId;
      });
      // console.log("arr", arr.slice(0, 20));
      setSelectedNfts(arr.slice(0, 20));
    } else {
      setSelectedNfts([]);
    }
  }, [checked]);

  useEffect(async () => {
    // console.log('🚀 ~ useEffect ~ async nft inventory');

    // let filterData = await axios.get(
    //   `${
    //     process.env.REACT_APP_API_URL
    //   }/filter/${wallet?.accounts[0]?.address.toLowerCase()}/${renderData.collection_address.toLowerCase()}`
    // );
    // console.log('🚀 ~ useEffect ~ filterData', filterData);
    // GetNfts({
    //   variables: {
    //     address: wallet?.accounts[0]?.address.toLowerCase(),
    //     tokenAddress: renderData.collection_address.toLowerCase(),
    //   },
    //   onCompleted: (data) => {
    //     console.log('nftdata', data);
    //     setIsLoading(false);
    //     const arr = data.Nfts;
    //     // .filter((i) => {
    //     //   return i.tokenAddress == renderData.collection_address.toLowerCase();
    //     // });
    //     // console.log("arr", arr);

    //     setNftData(arr);
    //   },
    // });

    runApp();
    getBoostNft()
  }, [renderData]);
const getBoostNft=async()=>{
  try {
    const boostNftAddress = renderData?.boostNftAddress;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: wallet?.accounts[0]?.address.toLowerCase(),
      chain: '0x19',
      tokenAddresses: [boostNftAddress],
      mediaItems: true,
    });

    // console.log('🚀 ~ runApp ~ response', response.raw);

    setIsLoading(false);
    setBoostNftData(response?.raw?.result);
  } catch (e) {
    console.error(e);
  }
}
  const runApp = async () => {
    try {
      const chain = EvmChain.CRONOS;
      // console.log('renderdata runApp', renderData);
      const collectionAddr = renderData?.collection_address;

      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: wallet?.accounts[0]?.address.toLowerCase(),
        chain: '0x19',
        tokenAddresses: [collectionAddr],
        mediaItems: true,
      });

      // console.log('🚀 ~ runApp ~ response', response.raw);

      setIsLoading(false);
      setNftData(response?.raw?.result);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // console.log('selectedNfts', selectedNfts);
    // console.log('selectedboostNfts', selectedBoostNft);
  }, [selectedNfts,selectedBoostNft]);

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

  const boostNftcardSelectHandle = (tokenId) => {
    if (!selectedBoostNft.includes(tokenId)) {
      setSelectedBoostNft([ tokenId]);
    } else {
      const filter = selectedBoostNft.filter((id) => {
        return id != tokenId;
      });
      setSelectedBoostNft(filter);
    }
  };

  useEffect(() => {
    if (selectedNfts.length > 20) {
      setSelectedNfts(selectedNfts.slice(0, 20));
    }

  }, [selectedNfts]);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 350, sm: 690, md: 1000 },
    bgcolor: '#16182d',
    // border: "2px solid #000",
    // boxShadow: 24,
    p: '35px 25px 25px',
    borderRadius: '15px',
  };

  const createIpfsUrl = (e) => {
    let url = e.split('//');
    console.log('🚀 ~ createIpfsUrl ~ url', url);
  };
  const closeHandler = () => {
    handleClose();
  };

  return (
    <>
      <Box sx={style}>
        <Box sx={{ position: 'relative' }}>
          <CloseIcon
            sx={{
              position: 'absolute',
              top: '-53px',
              right: '-20px',
              color: '#ffffff',
              zIndex: '999999',
              cursor: 'pointer',
              fontSize: { xs: '45px', md: '45px' },
              pr: '15px',
            }}
            onClick={closeHandler}
          />
          <Container>
            <Box sx={{ flexGrow: 1 }}>
              <Grid
                container
                spacing={2}
                sx={{
                  marginTop: '30px',
                  maxHeight: { xs: '400px', sm: '430px', md: '350px' },
                  minHeight: '85px',
                  overflowY: 'auto',
                  paddingRight: '15px',
                }}
              >
                {!nftData && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        lg={3}
                        // onClick={() => cardSelectHandle(item.tokenId)}
                      >
                        <NftCard
                          item={item}
                          cardSelectHandle={cardSelectHandle}
                          selectedNfts={selectedNfts}
                          renderData={renderData}
                        />
                      </Grid>
                    );
                  })}

                {/* Boost nft  section start */}

                <Grid container>
                  <Grid item md={12}>
                    {/* <hr className='myBorder' /> */}

                    <h4 className='mt-3 mb-0 text-center myBorder'>
                      Boost NFT
                    </h4>
                    <Box sx={{ flexGrow: 1 }}>
                      <Grid
                        container
                        spacing={2}
                        sx={{
                          marginTop: '30px',
                          paddingRight: '15px',
                        }}
                      >
                        {!boostNftData && (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          </Grid>
                        )}
                        {boostNftData &&
                          boostNftData.map((item, idx) => {
                            return (
                              <Grid
                                key={`pdt_${idx}`}
                                item
                                xs={12}
                                sm={6}
                                md={3}
                                lg={3}
                                // onClick={() => cardSelectHandle(item.tokenId)}
                              >
                                <BoostNftCard
                                  item={item}
                                  boostNftcardSelectHandle={boostNftcardSelectHandle}
                                  selectedBoostNft={selectedBoostNft}
                                  renderData={renderData}
                                />
                              </Grid>
                            );
                          })}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>

                {/* Boost nft  section start */}

                {selectedNfts.length > 25 && (
                  <Box>Please select no more than 25 NFTs at once!</Box>
                )}
                {nftData && !nftData.length && (
                  <Box
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <Typography component={'span'}>
                      No Nfts to stake!
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box className='stake_popup_btn text-center mt-4'>
                    {/* {nftData && nftData.length > 0 && (
                      <Box sx={{ display: 'flex' }}>
                        <Typography
                          component={'input'}
                          type={'checkbox'}
                          onChange={selectMultipleHandler}
                          checked={checked}
                        />
                        <Typography component={'p'} sx={{ ml: '5px' }}>
                          Select max NFTs
                        </Typography>
                      </Box>
                    )} */}
                    {selectedNfts.length == 20 && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography component={'span'}>
                          Cannot select more than 20 NFTs!
                        </Typography>
                      </Box>
                    )}
                    <button
                      className='btn input-btn mt-2'
                      onClick={() => confirmStake(selectedNfts,selectedBoostNft)}
                      disabled={!selectedNfts.length}
                    >
                      {isLoading ? (
                        <div className='col-12 text-center'>
                          <div className='spinner-border' role='status'>
                            <span className='visually-hidden'></span>
                          </div>
                        </div>
                      ) : (
                        'Stake'
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

export default NftInventoryModal;
