import { ChainId, useEthers } from '@usedapp/core';
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import abi from '../../abi/contractABI.json';
import colAbi from '../../abi/collectionAbi.json';
import { Link } from 'react-router-dom';

import rewardAbi from '../../abi/rewardToken.json';
// import { Modal } from "react-responsive-modal";
import NftInventoryModal from '../Modal/NftInventoryModal';
import StakingPoolInventoryModal from '../Modal/StakingPoolInventoryModal';
import { useConnectWallet } from '@web3-onboard/react';
import Countdown from 'react-countdown';
import { useLazyQuery, useMutation } from '@apollo/client';
import { collectionData } from '../../graphql/collections/collectionQueries';
import { useNavigate, useParams } from 'react-router';
import { updateCollection } from '../../graphql/collections/collectionMutations';
import { networkHashMap } from '../common/constants';
import { useSetChain } from '@web3-onboard/react';
import Modal from '@mui/material/Modal';
import { ToastContainer, toast } from 'react-toastify';

import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { saveCollection } from '../../redux/action';
import { ethers } from 'ethers';
import bigInt from 'big-integer';

const StakingPool = ({ renderData }) => {
  // MUI Popup Start UseState
  // const [open, setOpen] = React.useState(false);
  // const handleOpen = () => {
  //   setOpen(true);
  // };
  // const handleClose = () => setOpen(false);
  // MUI Popup End UseState
  const [{ connectedChain, chains }] = useSetChain();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [reward, setReward] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalStaked, setTotalStaked] = useState(0);
  const [stakingFee, setStakingFee] = useState(null);
  const [withdrawFee, setWithdrawFee] = useState(null);
  const [claimFee, setClaimFee] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewardsPerWeek, setRewardsPerWeek] = useState();
  const [rewardsDuration, setRewardsDuration] = useState(null);
  const [rewardAmount, setRewardAmount] = useState(null);
  const [duration, setDuration] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  // const [boostedCount, setBoostedCount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [decimals, setDecimals] = useState(null);
  // const [display, setDisplay] = useState("null");

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const { contract_address, collection_address, token_address } = renderData;

  const etherProvider = () => {
    try {
      return new ethers.providers.Web3Provider(wallet?.provider);
    } catch (error) {
      console.log('🚀 ~ StakingPool ~ error', error);
    }
  };
  const _pp = () => {
    try {
      return new ethers.providers.Web3Provider(wallet?.provider);
    } catch (error) {
      console.log('🚀 ~ StakingPool ~ error', error);
    }
  };
  const etherSigner = etherProvider()?.getSigner();
  const etherContractInst = new ethers.Contract(
    contract_address?.toLowerCase(),
    abi,
    etherSigner
  );

  const etherCollContrInst = new ethers.Contract(
    collection_address?.toLowerCase(),
    colAbi,
    etherSigner
  );

  const web3 = new Web3(wallet?.provider);

  const contractInstance = new web3.eth.Contract(abi);
  contractInstance.options.address = contract_address?.toLowerCase();

  const collectionContractInstance = new web3.eth.Contract(colAbi);
  collectionContractInstance.options.address =
    collection_address?.toLowerCase();

  // set the chargeStake, chargeWithdraw, chargeClaim needs to be set.
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      setIsCompleted(true);
      return (
        <span className='complete_countdown_text'>Countdown complete!</span>
      );
    } else {
      return (
        <span className='time_part'>
          {days}d {hours}h:{minutes}m:{seconds}s
        </span>
      );
    }
  };

  useEffect(() => {
    const body = document.querySelector('html');
    body.style.overflow = isModalOpen ? 'hidden' : 'scroll';
  }, [isModalOpen]);

  const navigate = useNavigate();

  const [UpdateCollection] = useMutation(updateCollection);

  const dateInputHandler = (e) => {
    setDuration(parseInt(new Date().getTime() + e.target.value * 1000));
  };

  const rewardsDurationHandler = async () => {
    setBtnLoading(true);
    let data = {
      _id: renderData._id,
      expire_date: `${duration}`,
    };
    let _addDate = axios
      .put(process.env.REACT_APP_API_URL, data)
      .then((res, err) => {
        if (err) {
          setLoading(false);
          throw err;
        }
        setBtnLoading(false);

        return res;
      });
    // if (duration) {
    //   UpdateCollection({
    //     variables: {
    //       payload: {
    //         _id: renderData._id,
    //         expire_date: `${duration}`,
    //       },
    //     },
    //     onCompleted: (data) => {
    //       console.log("dataUpdated", data);
    //       navigate("/");
    //     },
    //   });
    // }
  };

  const calculateGas = async (params) => {
    console.log('🚀 ~ calculateGas ~ params', params[0].length);
    console.log('🚀 ~ calculateGas ~ params', params[1]);
    console.log('🚀 ~ calculateGas ~ params', params[2]);
    try {
      let gasss = await etherContractInst.calculateFee(
        wallet?.accounts[0]?.address, //user address
        params[0].length, //length of nft
        params[1], //isboost
        params[2] //boostnftid
      );
      // console.log('🚀 ~ calculateGas ~ gasss', gasss.toString());
      return gasss.toString();
    } catch (error) {
      console.log('🚀 ~ calculateGas ~ error', error);
    }
  };

  const handleStake = async (selectedNfts, boostnft) => {
    console.log('🚀 ~ handleStake ~ selectedNfts', selectedNfts);
    console.log('🚀 ~ handleStake ~ selectedboostnftNfts', boostnft);

    try {
      let callStake = await etherCollContrInst
        .isApprovedForAll(wallet?.accounts[0]?.address, contract_address)
        .then(async (data) => {
          // console.log('🚀 ~ .then ~ data', !data);
          if (!data) {
            // console.log('🚀 ~ .then ~ data', data);
            etherCollContrInst
              .setApprovalForAll(contract_address, true)
              .then(async (data) => {
                let params;
                if (boostnft.length > 0) {
                  params = [[...selectedNfts], true, boostnft[0]];
                  console.log('🚀 ~ .then ~ if params', params);
                } else {
                  params = [[...selectedNfts], false, 13];
                  console.log('🚀 ~ .then else  ~ params', params);
                }

                let _gas = await calculateGas(params);
                let val = bigInt(selectedNfts.length * _gas);
                // console.log('🚀 ~ .then ~ selectedNfts', selectedNfts.length);
                // console.log('🚀 ~ .then ~ selectedNfts stakingFee', stakingFee);

                let _tx = await etherContractInst
                  .stake(...params, {
                    value: val.toString(),
                  })
                  .then(async (data) => {
                    setIsModalOpen(false);
                    setIsLoading(false);
                    getTotalStaked();
                  })
                  .catch((err) => {
                    console.log('err', err);
                    setIsLoading(false);
                  });
              });
          } else {
            // console.log('esle');
            // console.log('🚀 ~ .then ~ selectedNfts', selectedNfts.length);
            // console.log('🚀 ~ .then ~ selectedNfts stakingFee', stakingFee);
            let params;
            if (boostnft.length > 0) {
              params = [[...selectedNfts], true, boostnft[0]];
              console.log('🚀 ~ .then if~ params', params);
            } else {
              params = [[...selectedNfts], false, 13];
              console.log('🚀 ~ .then  else~ params', params);
            }
            let _gas = await calculateGas(params);
            let val = bigInt(selectedNfts.length * _gas);
            // console.log('🚀 ~ .then ~ val', val);
            let _tx = await etherContractInst

              .stake(...params, { value: val.toString() })
              .then(async (data) => {
                // console.log('datatata', data);
                setIsModalOpen(false);
                setIsLoading(false);
                getTotalStaked();
              })
              .catch((err) => {
                console.log('err', err);
                setIsLoading(false);
              });
          }
        })
        .catch(async (err) => {
          console.log('err', err);
        });
    } catch (error) {
      console.log('🚀 ~  ~ error', error);
    }
  };

  const handleWithdraw = async (selectedNfts) => {
    const params = [collection_address.toLowerCase(), [...selectedNfts]];
    const gasEstimate = await contractInstance.methods['withdraw'](
      ...params
    ).estimateGas({
      from: wallet?.accounts[0]?.address,
      value: selectedNfts.length * withdrawFee,
    });
    const gasLimit = gasEstimate * 2;
    const tx = await contractInstance.methods['withdraw'](...params)
      .send({
        from: wallet?.accounts[0]?.address,
        value: selectedNfts.length * withdrawFee,
        gas: gasLimit,
      })
      .then(async (data) => {
        // const receipt = await web3.eth.getTransactionReceipt(
        //   tx.transactionHash
        // );
        // console.log("receipt", receipt.status);
        setIsWithdrawModalOpen(false);
        setIsLoading(false);
        getTotalStaked();
      })
      .catch((err) => {
        console.log('err', err);
        setIsLoading(false);
      });
    // const gasFee = await calculateGas();

    // contractInstance.methods
    //   .withdraw(collection_address, [...selectedNfts])
    //   .send({
    //     from: wallet?.accounts[0]?.address,
    //     value: selectedNfts.length * withdrawFee,
    //     // value: boostedCount > 1 ? "0" : selectedNfts.length * withdrawFee,
    //     // gas: selectedNfts.length == 1 ? 350000 : selectedNfts.length * 180000,
    //     gasLimit:
    //       wallet.label != "MetaMask" &&
    //       (selectedNfts.length == 1 ? 262500 : selectedNfts.length * 131250),
    //     gasPrice: web3.utils.toWei(
    //       gasFee.speeds[2].maxFeePerGas.toString(),
    //       "gwei"
    //     ),
    //   })
    //   .then((receipt) => {
    //     console.log("receipt=======>", receipt);
    //     setIsWithdrawModalOpen(false);
    //     setIsLoading(false);
    //     getTotalStaked();
    //   })
    //   .catch((err) => {
    //     console.log("error=======>", err);
    //     setIsLoading(false);
    //   });
  };
  const _chargeClaim = async () => {
    //new
    let _gas = await etherContractInst.chargeClaim();
    //old
    // let _gas = await contractInstance.methods.chargeClaim().call();
    return _gas;
  };
  const handleClaim = async () => {
    let _gas = await _chargeClaim();
    // console.log('🚀 ~ handleClaim ~ _gas', _gas.toString());
    setLoading(true);
    await etherContractInst
      .claimReward({ value: _gas.toString() })
      .then(async (receipt) => {
        // console.log(
        //   '🚀 ~ awaitetherContractInst.claimReward ~ receipt',
        //   receipt
        // );
        setLoading(false);
      })
      .catch(async (err) => {
        console.log('err', err);
        setLoading(false);
      });

    // const gasEstimate = await contractInstance.methods[
    //   'claimReward'
    // ]().estimateGas({
    //   from: wallet?.accounts[0]?.address,
    //   value: _gas,
    // });
    // contractInstance.methods
    //   .claimReward()
    //   .send({
    //     from: wallet?.accounts[0]?.address,
    //     value: _gas,
    //     gas: gasEstimate * 2,
    //   })
    //   .then((receipt) => {
    //     setLoading(false);
    //   })
    //   .catch((err) => {
    //     console.log('error=======>', err);
    //     setLoading(false);
    //   });
  };

  const getTotalStaked = async () => {
    try {
      let totalStaked = await etherContractInst.totalStaked(collection_address);
      if (totalStaked) {
        setTotalStaked(totalStaked.toString());
        setIsLoading(false);
      }
    } catch (error) {
      console.log('🚀 ~ getTotalStaked ~ error', error);
    }
  };

  // useEffect(() => {
  //   if (wallet && wallet.label) {
  //     setDisplay(wallet.label + `${wallet.label != "MetaMask"}`);
  //   }
  // }, [wallet]);

  useEffect(async () => {
    if (wallet?.accounts[0]?.address) {
      try {
        await etherContractInst
          .earned(collection_address, wallet?.accounts[0]?.address)
          .then(async (data) => {
            // console.log('🚀 ~ .then sssss ~ data', data.toString());
            setReward(data.toString());
          });
      } catch (error) {
        console.log('🚀 ~ useEffect ~ error', error);
      }
    }
    getTotalStaked();
  }, [renderData, reward]);

  useEffect(() => {
    try {
      const amount = new Promise((res, rej) => {
        // console.log('eeee', etherContractInst);
        contractInstance.methods
          .rewardAmount()
          .call()
          .then((receipt) => {
            setRewardAmount(receipt);
            res(receipt);
          });
      });

      const duration = new Promise((res, rej) => {
        contractInstance.methods
          .rewardsDuration()
          .call()
          .then((receipt) => {
            // setRewardsDuration(receipt);
            res(receipt);
          });
      });
      Promise.all([amount, duration])
        .then(([result1, result2]) => {
          // console.log(result1, result2);
          setRewardAmount(result1);
          setRewardsDuration(result2);
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.log('🚀 ~ useEffect ~ error', error);
    }
  }, [renderData, wallet]);

  useEffect(() => {
    setRewardsPerWeek(
      parseInt(rewardAmount) / (parseInt(rewardsDuration) / 604800)
    );
  }, [rewardsDuration]);

  // useEffect(() => {
  //   rewardContractInstance.methods
  //     .symbol()
  //     .call()
  //     .then((data) => {
  //       setSymbol(data);
  //     });

  //   rewardContractInstance.methods
  //     .decimals()
  //     .call()
  //     .then((data) => {
  //       // console.log(data);
  //       setDecimals(data);
  //     });
  // }, [reward]);

  useEffect(() => {
    if (process.env.REACT_APP_ENVIRONMENT == 'DEV') {
      setChainId(ChainId.CronosTestnet);
    } else {
      setChainId(ChainId.Cronos);
    }
  }, [wallet]);

  const modalHandler = () => {
    setIsModalOpen(!isModalOpen);
  };

  const withdrawModalHandler = () => {
    setIsWithdrawModalOpen(!isWithdrawModalOpen);
  };
  const exitModalHandler = async () => {
    try {
      await etherContractInst
        .removeFromStake()
        .then(async (data) => {
          // console.log('data', data);
        })
        .catch(async (err) => {
          console.log('err', err);
        });
    } catch (error) {
      console.log('🚀 ~ exitModalHandler ~ error', error);
    }

    // setIsWithdrawModalOpen(!isWithdrawModalOpen);
  };

  // useEffect(() => {
  //   if (wallet) {
  //     contractInstanceB.methods
  //       .isBoostActive()
  //       .call()
  //       .then((data) => {
  //         console.log("isBoostActive", data);
  //         if (data) {
  //           contractInstanceB.methods
  //             .getBoostCount(wallet?.accounts[0]?.address)
  //             .call()
  //             .then((data) => {
  //               console.log("data", data);
  //               setBoostedCount(data);
  //             })
  //             .catch((err) => {
  //               console.log("err", err);
  //             });
  //         }
  //       })
  //       .catch((err) => {
  //         console.log("err", err);
  //       });
  //   }
  // }, [wallet]);

  return (
    <>
      <ToastContainer />
      {/* {true && ( */}
      <section className='stack_two_new_list'>
        <div className='container'>
          <div className='row'>
            <div className='col-12'>
              <div className='stackCardWrapper'>
                {wallet &&
                  renderData?.creator_address ==
                  wallet.accounts[0].address.toLowerCase() && (
                    <>
                        <Link
                  to={`/admin/${contract_address}`}
                  className='project-link'
                >
                  Update Contract
                </Link>
                    </>
                  )

                }
            
                <div className='card-header bg-inherit border-0 p-0'>
                  <h2 className='m-0'>
                    <button
                      className='staking-btn d-block text-left w-100 py-4'
                      type='button'
                      data-toggle='collapse'
                      data-target={`#collapse${renderData?._id}`}
                    >
                      <div className='row'>
                        <div className='col-12 col-md-8'>
                          <div className='media flex-column flex-md-row'>
                            <img
                              className='avatar-max-lg'
                              src={
                                renderData?.picture
                                  ? renderData?.picture
                                  : '/img/placeholder.png'
                              }
                              alt=''
                            />
                            <div className='content media-body  ml-md-4 w-100'>
                              <h4 className='m-0'>{renderData?.name}</h4>
                              <span className='symbol'>
                                {renderData?.symbol}
                              </span>
                              {/* {wallet && <span>{display}</span>} */}
                              <span className='address'>
                                address:
                                <a
                                  href={
                                    process.env.REACT_APP_ENVIRONMENT == 'DEV'
                                      ? `https://testnet.cronoscan.com/address/${contract_address}`
                                      : `https://cronoscan.com/address/${contract_address}`
                                  }
                                  target={'_blank'}
                                >
                                  {' '}
                                  {/* {contract_address} */}
                                  {contract_address?.substring(0, 5)}...
                                  {contract_address?.substring(37, 42)}
                                </a>
                              </span>

                              <p className='description'>
                                {renderData?.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='col-12 col-md-4'>
                          <span className='time_data'>
                            {totalStaked ?? ''} NFTs
                          </span>
                          {renderData?.expire_date && (
                            <Countdown
                              date={new Date(parseInt(renderData?.expire_date))}
                              intervalDelay={0}
                              precision={3}
                              renderer={renderer}
                            />
                          )}

                          {wallet &&
                            renderData?.creator_address ==
                              wallet.accounts[0].address.toLowerCase() && (
                              <>
                                <input
                                  className='rewardDurationInput'
                                  type='number'
                                  placeholder='Duration in Seconds'
                                  onChange={dateInputHandler}
                                />
                                <button
                                  className='btn input-btn mt-2 rewardDurationBtn'
                                  onClick={rewardsDurationHandler}
                                  disabled={!duration ? true : false}
                                >
                                  {btnLoading ? (
                                    <div className='col-12 text-center'>
                                      <div
                                        className='spinner-border'
                                        role='status'
                                      >
                                        <span className='visually-hidden'></span>
                                      </div>
                                    </div>
                                  ) : (
                                    'SetRewardDuration'
                                  )}
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </button>
                  </h2>
                </div>
                <div
                  id={`collapse${renderData?._id}`}
                  className='collapse show'
                  data-parent='#gameon-accordion'
                >
                  {/* Card Body */}

                  <div className='card-body'>
                    {wallet?.accounts[0]?.address && wallet ? (
                      chainId !== networkHashMap[connectedChain?.id] ? (
                        <div>
                          <span>Please Switch Your Network!</span>
                        </div>
                      ) : (
                        <div className='row d-flex justify-content-between'>
                          {/* Single Staking Item */}
                          {!isCompleted && (
                            <div className='col-12 col-md-2 single-staking-item input-box'>
                              <div className='input-area d-flex flex-column'>
                                <button
                                  // href="#"
                                  className='btn input-btn mt-2'
                                  // onClick={modalHandler}

                                  onClick={modalHandler}
                                >
                                  Deposit
                                </button>
                              </div>
                            </div>
                          )}
                          {/* <Modal
                            open={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            center
                          >
                            <NftInventoryModal
                              renderData={renderData}
                              handleStake={handleStake}
                              isLoading={isLoading}
                              setIsLoading={setIsLoading}
                            />
                          </Modal> */}
                          <Modal open={isModalOpen} onClose={modalHandler}>
                            <NftInventoryModal
                              renderData={renderData}
                              handleStake={handleStake}
                              isLoading={isLoading}
                              setIsLoading={setIsLoading}
                              handleClose={modalHandler}
                            />
                          </Modal>
                          <Modal
                            open={isWithdrawModalOpen}
                            onClose={() => setIsWithdrawModalOpen(false)}
                          >
                            <StakingPoolInventoryModal
                              renderData={renderData}
                              handleWithdraw={handleWithdraw}
                              isLoading={isLoading}
                              setIsLoading={setIsLoading}
                              handleClose={() => setIsWithdrawModalOpen(false)}
                            />
                          </Modal>
                          {/* Single Staking Item */}
                          {/* <div className='col-12 col-md-3 single-staking-item input-box'>
                            <span className='item-title mb-2'>Withdraw</span>
                            <div className='input-area d-flex flex-column'>
                              <button
                                // href="#"
                                className='btn input-btn mt-2'
                                onClick={withdrawModalHandler}
                              >
                                Withdraw
                              </button>
                            </div>
                          </div> */}
                          <div className='col-12 col-md-3 single-staking-item input-box'>
                            <div className='input-area d-flex flex-column'>
                              <button
                                // href="#"
                                className='btn input-btn mt-2'
                                onClick={exitModalHandler}
                              >
                                Withdraw all nft
                              </button>
                            </div>
                          </div>
                          {/* Single Staking Item */}
                          {/* {!isCompleted && ( */}
                          <div className='col-12 col-md-2 single-staking-item input-box'>
                            <div className='input-area d-flex flex-column'>
                              <button
                                // href="#"
                                className='btn input-btn mt-2'
                                onClick={handleClaim}
                              >
                                {loading ? (
                                  <div className='col-12 text-center'>
                                    <div
                                      className='spinner-border'
                                      role='status'
                                    >
                                      <span className='visually-hidden'></span>
                                    </div>
                                  </div>
                                ) : (
                                  'Claim'
                                )}
                              </button>
                            </div>
                          </div>
                          <div className='col-12 col-md-3 single-staking-item input-box'>
                            <span className='item-title mb-2'>
                              Pending rewards
                            </span>
                            <div className='input-area d-flex flex-column'>
                              <h4 className='price m-0'>
                                {' '}
                                {reward > 0
                                  ? ethers.utils.formatUnits(reward, 'gwei', {
                                      commify: true,
                                    })
                                  : 0}{' '}
                                {symbol && symbol}
                              </h4>
                              <span className='reward my-2'>
                                {/* Rewards are depleted, ask admins to fund it. */}
                              </span>
                            </div>
                          </div>
                          {/* )} */}
                          <div className='col-12 col-md-2 single-staking-item input-box'>
                            <span className='item-title mb-2'>Pool Rate</span>
                            <div className='input-area d-flex flex-column'>
                              <h4 className='price m-0'>
                                {rewardsPerWeek
                                  ? (
                                      rewardsPerWeek *
                                      10 ** -decimals
                                    ).toLocaleString('en-US', {
                                      maximumFractionDigits: 2,
                                    })
                                  : 0}{' '}
                                {symbol && symbol}/Week
                              </h4>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div>
                        <span>Please Connect Your Wallet!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* )} */}
    </>
  );
};

const StakingNFT = () => {
  const reduxDispatch = useDispatch();
  const params = useParams();

  const userData = useSelector((state) => state?.state);

  const [renderData, setRenderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // const { contract_address, collection_address, token_address } = renderData;

  const [GetCollection, { loading }] = useLazyQuery(collectionData, {
    fetchPolicy: 'network-only',
  });

  useEffect(async () => {
    if (userData?.collections?.length > 0) {
      let _data = userData?.collections.filter(
        (e) => e.contract_address == params.id
      );
      setRenderData(_data[0]);
      setIsLoading(false);
    }
  }, [params, userData?.collections]);

  useEffect(async () => {
    let collectionData = await axios.get(process.env.REACT_APP_API_URL);
    reduxDispatch(
      saveCollection({
        collections: collectionData?.data,
      })
    );

    return () => {};
  }, []);

  // useEffect(() => {
  //   GetCollection({
  //     variables: {
  //       filters: {
  //         contract_address: params.id,
  //       },
  //     },
  //     onCompleted: (data) => {
  //       setRenderData(data.Collections[0]);
  //       setIsLoading(false);
  //     },
  //     onError: (err) => {
  //       console.log(err);
  //     },
  //   });
  // }, [params]);

  return (
    <>
      {isLoading && (
        <section className='loader_sec stakingPool_loader'>
          <div className='container'>
            <div className='row'>
              <div className='col-12'>
                <div className='loader_wrapper'>
                  <div className='spinner-border' role='status'>
                    <span className='visually-hidden'></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <div>{renderData && <StakingPool renderData={renderData} />}</div>
    </>
  );
};

export default StakingNFT;
