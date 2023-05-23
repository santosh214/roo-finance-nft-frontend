import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import abi from '../../abi/contractABI.json';
import { tokenByteCode } from '../../abi/constants';
import { convertBase64 } from '../common/utils';
import { useMutation } from '@apollo/client';
import { createCollection } from '../../graphql/collections/collectionMutations';
import { useEthers } from '@usedapp/core';
import { useNavigate } from 'react-router';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { useConnectWallet } from '@web3-onboard/react';
import axios from 'axios';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export default function Reward(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [rewardAmount, setRewardAmount] = useState('');
  const [rewardDuration, setRewardDuration] = useState('');

  const etherProvider = () => {
    try {
      return new ethers.providers.Web3Provider(wallet?.provider);
    } catch (error) {
      console.log('🚀 ~ StakingPool ~ error', error);
    }
  };
  const etherSigner = etherProvider()?.getSigner();
  const standardtokenContract = new ethers.Contract(
    props?.address.toLowerCase(),
    abi,
    etherSigner
  );
  console.log('🚀 ~ Fee ~ etherContractInst', standardtokenContract);

  const _setRewardAmount = async () => {
    try {
      setIsLoading2(true);
      let fee = await standardtokenContract.setRewardAmount(rewardAmount);
      let waitFortx = await fee.wait();
      if (waitFortx) {
        setIsLoading2(false);
        toast.success('Transaction successful');
      }
    } catch (error) {
      setIsLoading2(false);
      toast.error('Transaction failed');

      console.log('🚀 ~ const_setRewardAmount= ~ error', error);
    }
  };
  const _setRewardsDuration = async () => {
    try {
      setIsLoading(true);
      let fee = await standardtokenContract.setRewardsDuration(rewardDuration);
      let waitFortx = await fee.wait();
      if (waitFortx) {
        setIsLoading(false);
        toast.success('Transaction successful');
      }
    } catch (error) {
      console.log('🚀 ~ const_setRewardsDuration= ~ error', error);
      setIsLoading(false);
      toast.error('Transaction failed');
    }
  };

  return (
    <>
      <div className='container'>
        <div className='row '>
          <div className='col-6'>
            <h5 className=''>Set Reward Amount</h5>
            <div className='form-group'>
              <label htmlFor='name'>Amount</label>
              <input
                type='text'
                id='ramount'
                name='ramount'
                placeholder='Enter reward amount'
                required='required'
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
              />
            </div>
            <div className='col-12 '>
              {isLoading2 ? (
                <div className='spinner-border' role='status'>
                  <span className='visually-hidden'></span>
                </div>
              ) : (
                <button
                  className='btn btn-primary active'
                  onClick={_setRewardAmount}
                >
                  submit
                </button>
              )}
            </div>
          </div>
          <div className='col-6'>
            <h5 className=''>Set Reward duration</h5>
            <div className='form-group'>
              <label htmlFor='name'>Duration</label>
              <input
                type='text'
                id='rduration'
                name='rduration'
                placeholder='Enter time in epoch format'
                required='required'
                value={rewardDuration}
                onChange={(e) => setRewardDuration(e.target.value)}
              />
            </div>
            <div className='col-12 '>
              {isLoading ? (
                <div className='spinner-border' role='status'>
                  <span className='visually-hidden'></span>
                </div>
              ) : (
                <button
                  className='btn btn-primary active'
                  onClick={_setRewardsDuration}
                >
                  submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
