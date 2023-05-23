import React, { useEffect, useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Wallet } from "../../onboard/onboard";
import ModalMenu from "../Modal/ModalMenu";
const Header = () => {
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
    <>
      <header id="header">
        {/* Navbar */}
        <nav
          data-aos="zoom-out"
          data-aos-delay={800}
          className="navbar gameon-navbar navbar-expand"
        >
          <div className="container header">
            {/* Logo */}
            <Link to="https://roo.finance" className="navbar-brand">
              <img src="\img/Roo.png" alt="Roo Finance" />
            </Link>
            <div className="ml-auto" />
            {/* Navbar Nav */}
            <ul className="navbar-nav items mx-auto">
              <li className="nav-item">
                <a href="https://roo.finance" className="nav-link">
                  Roo.finance{" "}
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href="https://roo.finance/projects" className="nav-link">
                  Projects
                </a>
              </li>
              <li className="nav-item dropdown">
                <Link to="/" className="nav-link">
                  Staking
                </Link>
              </li>
              <li className="nav-item">
                <a href="https://roo.finance/contact" className="nav-link">
                  Contact
                </a>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <span className="nav-link">
                    {/* <a href="/admin" className="nav-link"> */}
                    <Link to={"/admin"}>
                      Admin
                      {/* </a> */}
                    </Link>
                  </span>
                </li>
              )}
            </ul>
            {/* <ul className="navbar-nav icons">
              <li className="nav-item">
                <Link
                  to="#"
                  className="nav-link"
                  data-toggle="modal"
                  data-target="#search"
                >
                  <i className="icon-magnifier" />
                </Link>
              </li>
            </ul> */}
            <ul className="navbar-nav toggle">
              <li className="nav-item">
                <Link
                  to="#"
                  className="nav-link"
                  data-toggle="modal"
                  data-target="#menu"
                >
                  <i className="icon-menu m-0" />
                </Link>
              </li>
            </ul>
            {/* {isAdmin && (
              <ul className="navbar-nav toggle">
                <li className="nav-item">
                  <span className="nav-link">
                    <Link to={"/admin"}>Admin</Link>
                  </span>
                </li>
              </ul>
            )} */}
            {/* Navbar Action Button */}
            <ul className="navbar-nav action">
              <Wallet />
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
