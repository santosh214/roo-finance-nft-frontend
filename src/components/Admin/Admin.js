import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import abi from '../../abi/contractABI.json';
import { tokenByteCode } from '../../abi/constants';
import { convertBase64 } from '../common/utils';
import { useMutation } from '@apollo/client';
import { createCollection } from '../../graphql/collections/collectionMutations';
import { useEthers } from '@usedapp/core';
import { useNavigate, useParams } from 'react-router';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { useConnectWallet } from '@web3-onboard/react';
import axios from 'axios';
import { ethers } from 'ethers';
import Fee from './Fee';
import Reward from './Reward';
import Other from './Other';

const DragAndDrop = ({ formData, setFormData }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const imageDropHandler = async (file) => {
    const base64 = await convertBase64(file);
    setPreviewImage(file);
    setFormData({ ...formData, image: base64 });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    maxSize: 500000,
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];

      imageDropHandler(file);
    },
    onDropRejected: (abc) => {
      console.log(abc[0].errors[0].message);
      setErrorMsg(abc[0].errors[0].message);
    },
  });

  // const previewImage = objectKeyFetch(formData.avatar_url);

  return (
    <div className='drag_drog admin_form_dropzone_wrapper'>
      {!formData?.image ? (
        <div {...getRootProps({ className: 'dropzone admin_form_dropzone' })}>
          {/* <label for="file-upload" class="admin_upload_label">
            <i class="fa fa-cloud-upload"></i> Upload a picture
          </label> */}
          <input {...getInputProps()} name='avatar_url' type='file' />
          {/* <img src={CirclePlus} alt="" /> */}
          <p className='admin_dropzone'>
            Drag 'n' drop some files here,
            <br />
            or click to select files
            <br />
            <i className='fas fa-plus'></i>
          </p>

          {errorMsg && (
            <p
              style={{
                marginTop: '50px',
                color: '#ff0000 !important',
                fontWeight: '600',
              }}
            >
              {errorMsg}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className='upload_img_wrapper'>
            <span>
              <img
                className='uploaded_image'
                src={previewImage && URL.createObjectURL(previewImage)}
                height={100}
                style={{ borderRadius: '10px' }}
              />{' '}
              <span
                onClick={() => {
                  setFormData({ ...formData, image: '' });
                  setErrorMsg(null);
                }}
              >
                <i className='fas fa-plus'></i>
              </span>
            </span>
          </div>

          {/* <button
            className="btn btn-bordered active"
            onClick={() => {
              setFormData({ ...formData, image: "" });
              setErrorMsg(null);
            }}
          >
            Delete
          </button> */}
        </>
      )}
    </div>
  );
};

const Admin = () => {
  const params = useParams();
  console.log('🚀 ~ Admin ~ params', params?.address);

  // const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({});
  const [newContract, setNewContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // const { account } = useEthers();
  const navigate = useNavigate();
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [CreateCollection] = useMutation(createCollection);
  const userData = useSelector((state) => state?.state);

  useEffect(() => {
    if (userData.role == 'admin') {
      navigate('/');
    }
  }, [userData]);

  useEffect(async () => {
    if (newContract) {
      console.log('formdata', formData);

      let obj = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        contract_address: newContract,
        creator_address: userData.walletAddress,
        picture: formData.image,
        token_address: formData.ERC20Address,
        collection_address: formData.collectionAddress,
        communityAddress: formData.communityAddress,
        boostNftAddress: formData.boostNftAddress,
      };

      let _createCollection = await axios
        .post('http://localhost:4000/users', obj)
        .then((res, err) => {
          if (err) {
            console.log('🚀 ~ let_createCollection=awaitaxios.post ~ err', err);
            return err;
          }
          navigate('/');

          console.log('res', res);
        });

      // CreateCollection({
      //   variables: {
      //     payload: {
      //       name: formData.name,
      //       symbol: formData.symbol,
      //       description: formData.description,
      //       contract_address: newContract,
      //       creator_address: userData.walletAddress,
      //       picture: formData.image,
      //       token_address: formData.ERC20Address,
      //       collection_address: formData.collectionAddress,
      //     },
      //   },
      //   onCompleted: (data) => {
      //     console.log('data', data);
      //   },
      // }).then(() => {
      //   navigate('/');
      // });
    }
  }, [newContract]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  useEffect(() => {
    if (userData.walletAddress && userData) {
      if (userData.role == 'admin') {
        navigate('/');
      }
    }
  }, [userData.walletAddress]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const etherProvider = () => {

      try {
        return new ethers.providers.Web3Provider(wallet?.provider);
      } catch (error) {
        console.log('🚀 ~ StakingPool ~ error', error);
      }
    };
    const etherSigner = etherProvider()?.getSigner();
    const factory = new ethers.ContractFactory(
      abi,
      '0x' + tokenByteCode,
      etherSigner
    );

    let _arguments = [
      formData.ERC20Address,
      formData.collectionAddress,
      formData.boostNftAddress,
      formData.collectionAddress,
    ];
    setIsLoading(true)
    const contract = await factory
      .deploy(..._arguments)
      .then(function (newContractInstance) {
        console.log('🚀 ~ newContractInstance', newContractInstance?.address);
        if (!newContractInstance?.address) {
          console.log(newContractInstance?.addresse);
          return;
        }
        console.log(
          'Deployed Contract Address : ',
          newContractInstance?.address
        );

        setNewContract(newContractInstance?.address);
        setIsLoading(false);
      })
      .catch(function (error) {
        console.log('🚀 ~ error', error);
        setIsLoading(false);
      });
  };
  const _submitHandler = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('userdata', userData);
    const web3 = new Web3(wallet?.provider);
    const standardtokenContract = new web3.eth.Contract(abi);

    standardtokenContract
      .deploy({
        data: '0x' + tokenByteCode,
        arguments: [
          formData.ERC20Address,
          formData.collectionAddress,
          formData.boostNftAddress,
          formData.collectionAddress,
        ],
      })
      .send(
        {
          from: '0xbBA8732Ee7c9e61Bc05Af01006785d0d6cd2471e',
          gasPrice: '1915983702291',
        },
        function (error, transactionHash) {
          if (error) {
            console.error(error);
            setIsLoading(false);

            return;
          }
          console.log('Transaction Hash :', transactionHash);
        }
      )
      .on('confirmation', function () {
        return;
      })
      .then(function (newContractInstance) {
        if (!newContractInstance.options.address) {
          console.log(newContractInstance);
          return;
        }
        console.log(
          'Deployed Contract Address : ',
          newContractInstance.options.address
        );
        setNewContract(newContractInstance.options.address);
      })
      .catch(function (error) {
        console.error('error', error);
        setIsLoading(false);
      });
  };

  const inputChangeHandler = ({ target: { name, value } }) => {
    formData[name] = value.trim();
    let newObj = { ...formData };
    setFormData(newObj);
  };

  return (
    // <>
    //   <section className='apply-area contact'>

    //   </section>
    // </>
    <section>
      <div className='container-fluid section'>
        <div className='row'>
          {/* menu section start */}
          <div className='col-12 col-lg-2 d-flex justify-content-center '>
            <ul
              className='nav nav-tabs d-block border-0'
              id='myTab'
              role='tablist'
            >

              {params?.address ?
              <>
                            <li className='nav-item mb-3' role='presentation'>
                <button
                  className='nav-link active mb-1'
                  id='home-tab'
                  data-bs-toggle='tab'
                  data-bs-target='#home'
                  type='button'
                  role='tab'
                  aria-controls='home'
                  aria-selected='true'
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid green',
                    color: 'white',
                    width: '210px',
                  }}
                >
                  Home
                </button>
              </li>
              <li className='nav-item mb-3' role='presentation'>
                <button
                  className='nav-link mb-1'
                  id='allVault-tab'
                  data-bs-toggle='tab'
                  data-bs-target='#allVault'
                  type='button'
                  role='tab'
                  aria-controls='allVault'
                  aria-selected='false'
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid green',
                    color: 'white',
                    width: '210px',
                  }}
                >
                  Fee
                </button>
              </li>

              <li className='nav-item mb-3' role='presentation'>
                <button
                  className='nav-link mb-1'
                  id='reward-tab'
                  data-bs-toggle='tab'
                  data-bs-target='#reward'
                  type='button'
                  role='tab'
                  aria-controls='reward'
                  aria-selected='false'
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid green',
                    color: 'white',
                    width: '210px',
                  }}
                >
                  Reward
                </button>
              </li>
              <li className='nav-item mb-3' role='presentation'>
                <button
                  className='nav-link mb-1'
                  id='other-tab'
                  data-bs-toggle='tab'
                  data-bs-target='#other'
                  type='button'
                  role='tab'
                  aria-controls='other'
                  aria-selected='false'
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid green',
                    color: 'white',
                    width: '210px',
                  }}
                >
                  Other
                </button>
              </li>
              </>
              :''}

              {/* <li className="nav-item mb-3" role="presentation">
                <button
                  className="nav-link mb-1"
                  id="emailUsers-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#emailUsers"
                  type="button"
                  role="tab"
                  aria-controls="emailUsers"
                  aria-selected="false"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid green",
                    color: "white",
                    width: "210px",
                  }}
                >
                  Subscriber Email
                </button>
              </li> */}
            </ul>
          </div>
          {/* menu section end */}

          {/* content section start  */}
          <div className='col-lg-9'>
            <div className='tab-content' id='myTabContent'>
              <div
                className='tab-pane fade show active'
                id='home'
                role='tabpanel'
                aria-labelledby='home-tab'
              >
                <div className='container'>
                  <div className='row stack_row_box'>
                    <div className='container'>
                      <div className='row justify-content-center'>
                        <div className='col-12 col-lg-7'>
                          <div className='apply-form card no-hover'>
                            {/* Intro */}
                            <div className='intro d-flex justify-content-between align-items-end mb-4'>
                              <div className='intro-content'>
                                <h3 className='mt-3 mb-0'>Admin</h3>
                              </div>
                            </div>
                            <form id='contact-form'>
                              <div className='form-group'>
                                <label htmlFor='name'>Name</label>
                                <input
                                  type='text'
                                  id='name'
                                  name='name'
                                  placeholder='boredape'
                                  required='required'
                                  onChange={inputChangeHandler}
                                />
                              </div>
                              <div className='form-group'>
                                <label htmlFor='symbol'>Symbol</label>
                                <input
                                  type='text'
                                  id='symbol'
                                  name='symbol'
                                  placeholder='XYZ'
                                  required='required'
                                  onChange={inputChangeHandler}
                                />
                              </div>
                              <div className='form-group'>
                                <label htmlFor='description'>Description</label>
                                <textarea
                                  id='description'
                                  name='description'
                                  placeholder='Description'
                                  cols={30}
                                  rows={3}
                                  required='required'
                                  defaultValue={''}
                                  onChange={inputChangeHandler}
                                />
                                <small className='form-text mt-2'>
                                  Briefly describe what you need
                                </small>
                              </div>

                              <div className='form-group'>
                                <label htmlFor='ERC20Address'>
                                  ERC20 Address
                                </label>
                                <input
                                  type='text'
                                  id='ERC20Address'
                                  name='ERC20Address'
                                  placeholder='ERC20 Address'
                                  required='required'
                                  onChange={inputChangeHandler}
                                />
                              </div>

                              <div className='form-group'>
                                <label htmlFor='collectionaddress'>
                                  Collection Address
                                </label>
                                <input
                                  type='text'
                                  id='collectionAddress'
                                  name='collectionAddress'
                                  placeholder='Collection Address'
                                  required='required'
                                  onChange={inputChangeHandler}
                                />
                              </div>

                              <div className='form-group'>
                                <label htmlFor='ratio'>BoostNFt Address</label>
                                <input
                                  type='text'
                                  id='boostNftAddress'
                                  name='boostNftAddress'
                                  placeholder='BoostNFT Address'
                                  required='required'
                                  onChange={inputChangeHandler}
                                />
                              </div>
                              <div className='form-group'>
                                <label htmlFor='ratio'>Community Address</label>
                                <input
                                  type='text'
                                  id='communityAddress'
                                  name='communityAddress'
                                  placeholder='Community Address'
                                  required='required'
                                  onChange={inputChangeHandler}
                                />
                              </div>

                              <div className='form-group'>
                                <label htmlFor='picture'>Picture</label>
                                <DragAndDrop
                                  formData={formData}
                                  setFormData={setFormData}
                                />
                              </div>
                              <button
                                type='submit'
                                className='btn btn-bordered active'
                                onClick={submitHandler}
                                disabled={
                                  !formData.name ||
                                  !formData.symbol ||
                                  !formData.description ||
                                  !formData.ERC20Address ||
                                  !formData.collectionAddress
                                }
                              >
                                {isLoading ? (
                                  <div className='col-12 text-center'>
                                    <div
                                      className='spinner-border'
                                      role='status'
                                    >
                                      <span className='visually-hidden'></span>
                                    </div>
                                  </div>
                                ) : (
                                  'submit'
                                )}
                              </button>
                            </form>
                            <p className='form-message' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {params?.address ?
            <>  
            
              <div
                className='tab-pane fade'
                id='allVault'
                role='tabpanel'
                aria-labelledby='allVault-tab'
              >
                {/* <AllVault /> */}
                <Fee address={params?.address} />
              </div>

              <div
                className='tab-pane fade'
                id='reward'
                role='tabpanel'
                aria-labelledby='reward-tab'
              >
                <Reward address={params?.address} />
              </div>

              <div
                className='tab-pane fade'
                id='other'
                role='tabpanel'
                aria-labelledby='other-tab'
              >
                <Other  address={params?.address}/>
              </div>
           </>
           :''}   {/* deleteVault */}
            </div>
          </div>
          {/* content section end  */}
        </div>
      </div>
    </section>
  );
};

export default Admin;
