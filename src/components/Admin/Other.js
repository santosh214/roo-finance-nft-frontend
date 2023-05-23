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

export default function Other(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoading3, setIsLoading3] = useState(false);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [communityWalletAddress, setCommunityWalletAddress] = useState('');
  const [ownerClaimAddress, setOwnerClaimAddress] = useState('');
  const [removeFromStake, setRemoveFromStake] = useState('');

  const etherProvider = () => {
    try {
      return new ethers.providers.Web3Provider(wallet?.provider);
    } catch (error) {
      console.log('🚀 ~ StakingPool ~ error', error);
    }
  };
  const etherSigner = etherProvider()?.getSigner();
  const standardtokenContract = new ethers.Contract(
    props?.address?.toLowerCase(),
    abi,
    etherSigner
  );

  const _setCommunityWallet = async () => {
    try {
      setIsLoading(true);
      let tx = await standardtokenContract.setCommunityWallet(
        communityWalletAddress
      );
      let waitfortx = await tx.wait();
      if (waitfortx) {
        setIsLoading(false);
        toast.success('Transaction success!');
        // toast.error('Transaction failed!');
      }
    } catch (error) {
      // toast.success('Transaction success!');
      toast.error('Transaction failed!');
      setIsLoading(false);

      console.log('🚀 ~ _setCommunityWal ~ error', error);
    }
  };

  const _ownerClaimReward = async () => {
    try {
      setIsLoading2(true);
      let tx = await standardtokenContract.ownerClaimReward(ownerClaimAddress);
      let waitfortx = await tx.wait();
      if (waitfortx) {
        setIsLoading2(false);
        toast.success('Transaction success!');
        // toast.error('Transaction failed!');
      }
    } catch (error) {
      setIsLoading2(false);
      // toast.success('Transaction success!');
      toast.error('Transaction failed!');
      console.log('🚀 ~ _setCommunityWal ~ error', error);
    }
  };

  const _removeFromStake = async () => {
    try {
      setIsLoading3(true);
      let tx = await standardtokenContract.ownerRemoveFromStakeForUser(
        removeFromStake
      );
      let waitfortx = await tx.wait();
      if (waitfortx) {
        setIsLoading3(false);
        toast.success('Transaction success!');
        // toast.error('Transaction failed!');
      }
    } catch (error) {
      setIsLoading3(false);
      //   toast.success('Transaction success!');
      toast.error('Transaction failed!');
      console.log('🚀 ~ _setCommunityWal ~ error', error);
    }
  };

  return (
    <>
      <div className='container'>
        <div className='row'>
          <div className='col-6'>
            <h5>Set Community Wallet</h5>
            <div className='form-group'>
              <label htmlFor='name'>Enter address</label>
              <input
                type='text'
                id='communityAddress'
                name='communityAddress'
                placeholder='Enter address'
                required='required'
                value={communityWalletAddress}
                onChange={(e) => setCommunityWalletAddress(e.target.value)}
              />
            </div>
            {isLoading ? (
              <div className='spinner-border' role='status'>
                <span className='visually-hidden'></span>
              </div>
            ) : (
              <button
                className='btn btn-primary active'
                onClick={_setCommunityWallet}
              >
                submit
              </button>
            )}{' '}
          </div>
          <div className='col-6'>
            <h5>Owner claim reward</h5>
            <div className='form-group'>
              <label htmlFor='name'>Enter address</label>
              <input
                type='text'
                id='ocAddress'
                name='ocAddress'
                placeholder='Enter address'
                required='required'
                value={ownerClaimAddress}
                onChange={(e) => setOwnerClaimAddress(e.target.value)}
              />
            </div>
            {isLoading2 ? (
              <div className='spinner-border' role='status'>
                <span className='visually-hidden'></span>
              </div>
            ) : (
              <button
                className='btn btn-primary active'
                onClick={_ownerClaimReward}
              >
                submit
              </button>
            )}{' '}
          </div>
        </div>
        <div className='row'>
          <div className='col-6'>
            <h5>Remove from stake (user)</h5>
            <div className='form-group'>
              <label htmlFor='name'>Enter address</label>
              <input
                type='text'
                id='userAddress'
                name='userAddress'
                placeholder='Enter user address'
                required='required'
                value={removeFromStake}
                onChange={(e) => setRemoveFromStake(e.target.value)}
              />
            </div>
            {isLoading3 ? (
              <div className='spinner-border' role='status'>
                <span className='visually-hidden'></span>
              </div>
            ) : (
              <button
                className='btn btn-primary active'
                onClick={_removeFromStake}
              >
                submit
              </button>
            )}{' '}
          </div>
        </div>
      </div>
    </>
  );
}
