import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { getCollections } from "../../graphql/collections/collectionQueries";
import { useSelector } from "react-redux";
import Web3 from "web3";
import abi from "../../abi/contractABI.json";
import { Link } from "react-router-dom";
import Countdown from "react-countdown";
import axios from "axios";
import {saveCollection} from '../../redux/action'
import { useDispatch } from "react-redux";


// const BASE_URL = "https://my-json-server.typicode.com/j0ey1992/roo1/farming";

const StakingTwo = () => {
  const reduxDispatch = useDispatch();

  const [renderData, setRenderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const { contract_address } = renderData;
  const [GetCollections] = useLazyQuery(getCollections, {
    fetchPolicy: "network-only",
  });
  const userData = useSelector((state) => state?.state);
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      setIsCompleted(true);
      return (
        <span className="complete_countdown_text">Countdown complete!</span>
      );
    } else {
      return (
        <span className="time_part">
          {days}d {hours}h:{minutes}m:{seconds}s
        </span>
      );
    }
  };

  // useEffect(() => {
  //   console.log("userData", userData);
  // }, [userData]);

  async function getCollectionData() {

    let collectionData=await axios.get(process.env.REACT_APP_API_URL)
    reduxDispatch(
      saveCollection({
        collections:collectionData?.data
      })
    );
    setRenderData(collectionData?.data);
    console.log("🚀 ~ getCollectionDataa ~ collectionData", collectionData)
    setIsLoading(false);

    // await GetCollections({
    //   variables: {},
    //   onCompleted: (data) => {
    //     console.log("collections", data);
    //     setRenderData(data.Collections);
    //     setIsLoading(false);
    //   },
    // });
  }

  useEffect(() => {
    getCollectionData();
  }, []);

  const currTime = Math.floor(Date.now());

  const tabs = [
    {
      title: "Live",
      active: "active",
      show: "show",
      content: (
        <div className="row justify-content-center live_1">
          <div className="col-12">
            {/* Single Accordion Item */}
            {renderData.map((item, idx) => {
              console.log("🚀 ~ {renderData.map ~ item", item)
              const futureDate = parseInt(item?.expire_date );
              {console.log("🚀 ~ {renderData.map ~ futureDate", futureDate)}
              // need to change when deploy
              if (true) {
                return (
                  <div key={`pdt_${idx}`} className="col-12 item">
                    <div className="card project-card prev-project-card previous_launches_list_wrapper">
                      <div className="project-content">
                        <div className="item-header d-flex align-items-center">
                          <img
                            className="card-img-top avatar-max-lg"
                            src={
                              item?.picture
                                ? item?.picture
                                : "/img/placeholder.png"
                            }
                            alt=""
                          />

                          <div className="card_img_content">
                            <h4 className="m-0">{item?.name}</h4>
                            <span className="symbol">{item?.symbol}</span>
                            <span className="address">
                              address:
                              <a
                                href={`https://testnet.cronoscan.com/address/${contract_address}`}
                                target={"_blank"}
                              >
                                {" "}
                                {item?.contract_address.substring(0, 5)}...
                                {item?.contract_address.substring(37, 42)}
                              </a>
                            </span>
                            <p className="description">{item?.description}</p>
                          </div>
                        </div>
                        {item?.expire_date ?
                        <Countdown
                          date={new Date(parseInt(item?.expire_date))}
                          intervalDelay={0}
                          precision={3}
                          renderer={renderer}
                        />:""}
                      </div>
                      <Link
                        to={`/${item?.contract_address}`}
                        className="project-link"
                      />
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Finished",
      active: "",
      show: "",
      content: (
        <div className="row justify-content-center finished">
          <div className="col-12">
            {/* Single Accordion Item */}
            {renderData.map((item, idx) => {
              const futureDate = parseInt(item?.expire_date);
              if (futureDate < currTime) {
                return (
                  <div key={`pdt_${idx}`} className="col-12 item">
                    <div className="card project-card prev-project-card previous_launches_list_wrapper">
                      <div className="project-content">
                        <div className="item-header d-flex align-items-center">
                          <img
                            className="card-img-top avatar-max-lg"
                            src={
                              item?.picture
                                ? item?.picture
                                : "/img/placeholder.png"
                            }
                            alt=""
                          />

                          <div className="card_img_content">
                            <h4 className="m-0">{item?.name}</h4>
                            <span className="symbol">{item?.symbol}</span>
                            <span className="address">
                              address:
                              <a
                                href={`https://testnet.cronoscan.com/address/${contract_address}`}
                                target={"_blank"}
                              >
                                {" "}
                                {item?.contract_address.substring(0, 5)}...
                                {item?.contract_address.substring(37, 42)}
                              </a>
                            </span>
                            <p className="description">{item?.description}</p>
                          </div>
                        </div>
                        <Countdown
                          date={new Date(parseInt(item?.expire_date))}
                          intervalDelay={0}
                          precision={3}
                          renderer={renderer}
                        />
                      </div>
                      <Link
                        to={`/${item?.contract_address}`}
                        className="project-link"
                      />
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="staking-area">
      <div className="container">
        <div className="row stack_row_box justify-content-center">
          <div className="col-12 col-md-10">
            {/* Tab_Start */}
            <div id="gameon-accordion" className="accordion">
              <ul className="nav nav-tabs tab_header_inner" role="tablist">
                {tabs.map((item, id) => {
                  return (
                    <li className="nav-item" key={id}>
                      <a
                        className={`nav-link ${item.active}`}
                        id={`${item.title}-tab`}
                        data-toggle="tab"
                        href={`#${item.title}`}
                        role="tab"
                        aria-controls="home"
                        aria-selected="true"
                      >
                        {item.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="tab-content" id="myTabContent">
                {tabs.map((item, id) => {
                  return (
                    <div
                      className={`tab-pane fade ${item.show} ${item.active}`}
                      id={`${item.title}`}
                      role="tabpanel"
                      aria-labelledby="home-tab"
                      key={id}
                    >
                      {item.content}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Tab_End */}

            {isLoading && (
              <div className="col-12 text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden"></span>
                </div>
              </div>
            )}

            {/* <div id="gameon-accordion" className="accordion">
              <Tabs />
              
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakingTwo;
