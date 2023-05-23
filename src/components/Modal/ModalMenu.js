import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import { useDispatch, useSelector } from "react-redux";
import { useConnectWallet } from "@web3-onboard/react";

const ModalMenu = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const userData = useSelector((state) => state?.state);

  // useEffect(() => {
  //   console.log("userData", userData);
  // }, [userData]);

  useEffect(() => {
    if (wallet) {
      if (userData.role == "admin") {
        setIsAdmin(true);
      }
    } else {
      setIsAdmin(false);
    }
  }, [userData.role]);

  return (
    <div id="menu" className="modal fade p-0">
      <div className="modal-dialog dialog-animated">
        <div className="modal-content h-100">
          <div className="modal-header" data-dismiss="modal">
            Menu <i className="far fa-times-circle icon-close" />
          </div>
          <div className="menu modal-body">
            <div className="row w-100">
              <ul className="navbar-nav items mx-auto">
                <li className=" nav-item">
                  <Link to="https://roo.finance" className="nav-link">
                    Roo.finance
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <li className="nav-item">
                    <Link
                      to="https://roo.finance/projects"
                      className="nav-link"
                    >
                      Projects
                    </Link>
                  </li>
                </li>
                <li className="nav-item dropdown">
                  <li className="nav-item">
                    <a href="/" className="nav-link">
                      Staking
                    </a>
                  </li>
                </li>
                <li className="nav-item">
                  <Link to="https://roo.finance/contact" className="nav-link">
                    Contact
                  </Link>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <span className="nav-link">
                      <Link to={"/admin"}>Admin</Link>
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMenu;
