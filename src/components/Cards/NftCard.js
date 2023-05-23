import { Box, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import placeHolder from '../../images/placeholder.png';
import { getJSON } from '../common/utils';
import Web3 from 'web3';
import abi from '../../abi/contractABI.json';
import { useConnectWallet } from '@web3-onboard/react';
// getUserStakedNftId

const NftCard = ({ item, cardSelectHandle, selectedNfts, renderData }) => {
  // console.log('🚀 ~ NftCard ~ renderData', renderData);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const web3 = new Web3(wallet?.provider);

  const contractInstance = new web3.eth.Contract(abi);
  contractInstance.options.address =
    renderData?.contract_address?.toLowerCase();
  // console.log(
  //   '🚀 ~ NftCard ~ renderData?.contract_address',
  //   renderData?.contract_address
  // );

  const [selected, setSelected] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [disableNfts, setdisableNfts] = useState([]);
  const [alStaked, setAlstaked] = useState({});
  const selectorhandler = (id) => {
    if (selectedNfts.length > 19) {
      setSelected(false);
      cardSelectHandle(id);
    } else {
      setSelected(!selected);
      cardSelectHandle(id);
    }
  };

  const disableNft = async () => {
    let _disable = await contractInstance.methods
      .getUserStakedNftId(renderData?.collection_address)
      .call({ from: wallet?.accounts[0]?.address })
      .then((data) => {
        setdisableNfts(data);
      });
  };

  const alreadyStakeNfts = async () => {
    let object = {};
    let _alreadyStakeNfts = await contractInstance.methods
      .alreadyStakedNft(item?.token_id)
      .call()
      .then((data) => {
        if (data) {
          object[item.token_id] = data;
        }
        setAlstaked(object);
      });
  };
  useEffect(() => {
    if (item.token_uri) {
      const image = getJSON(item.token_uri);
      image.then((data) => {
        let cleanUri = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        setImageUri(cleanUri);
      });
    }
    disableNft();
    alreadyStakeNfts();
  }, []);

  const cardSelectionHandler = (val) => {
    let _dis = disableNfts.includes(item.token_id);

    if (_dis || val?.target?.innerText === 'Someone Staked') {
      return null;
    }
    selectorhandler(item.token_id);
  };

  return (
    <>
    <Box
      sx={{
        backgroundColor: '#00000069',
        borderRadius: '10px',
        boxShadow: '0 0 5px -1px #a2a2a2',
        cursor: 'pointer',
        height: 'calc(100% - 25px)',
        marginBottom: '25px',
        overflow: 'hidden',
        padding: '14px',
        position: 'relative',
      }}
      onClick={(e) => cardSelectionHandler(e)}
    >
      <Typography
        component={'img'}
        sx={{ height: 'auto', width: '100%', borderRadius: '8px' }}
        // src={item.picture}
        src={imageUri ? imageUri : '/img/placeholder.png'}
        alt=''
      />
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '5px',
          marginTop: '16px',
        }}
      >
        <Typography
          component={'h4'}
          sx={{ fontSize: '17px', fontWeight: 500, textAlign: 'left' }}
        >
          {item.name}
        </Typography>
        <Typography
          component={'span'}
          sx={{ fontSize: '15px', fontWeight: 400 }}
        >
          #{item.token_id}
        </Typography>
      </Box>

      {disableNfts.length > 0
        ? disableNfts.includes(item.token_id) && (
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#0047ff40',
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                left: '0',
                position: 'absolute',
                top: '0',
                width: '100%',
                zIndex: 10000,
                '& p': {
                  backgroundColor: '#0047ff',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  padding: '1px 10px',
                },
              }}
            >
              <Typography component={'p'}>Already Staked</Typography>
            </Box>
          )
        : ''}

      {alStaked[item?.token_id] ? (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#0047ff40',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            left: '0',
            position: 'absolute',
            top: '0',
            width: '100%',
            '& p': {
              backgroundColor: '#0047ff',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              padding: '1px 10px',
            },
          }}
        >
          <Typography component={'p'}>Someone Staked</Typography>
        </Box>
      ) : (
        ''
      )}

      {selectedNfts.includes(item.token_id) && (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#0047ff40',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            left: '0',
            position: 'absolute',
            top: '0',
            width: '100%',
            '& p': {
              backgroundColor: '#0047ff',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '20px',
              padding: '1px 10px',
            },
          }}
        >
          <Typography component={'p'}>Selected</Typography>
        </Box>
      )}
    </Box>
    </>
  );
};

export default NftCard;
