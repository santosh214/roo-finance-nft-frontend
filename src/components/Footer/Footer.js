import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BASE_URL = "https://my-json-server.typicode.com/j0ey1992/roo.json/footer";

const footerData = {
  img: "/img/logo.png",
  copyright: "©2022 Roo Finance, All Rights Reserved By",
  owner: "Roo Finance",
  ownerLink: "https://Roo.Finance",
};

const socialData = [
  {
    id: 1,
    link: "https://www.facebook.com/profile.php?id=100087503031319",
    icon: "icon-social-facebook",
  },
  {
    id: 2,
    link: "https://twitter.com/RooFinance",
    icon: "icon-social-twitter",
  },
  {
    id: 3,
    link: "https://www.youtube.com/channel/UCkH9DCBcjovuQg3tYbLnYTQ",
    icon: "icon-social-youtube",
  },
];
const widgetData = [
  {
    id: 1,
    text: "Projects",
    link: "https://roo.finance/projects",
  },
  {
    id: 2,
    text: "Roadmap",
    link: "https://roo-finance.gitbook.io/roadmap./",
  },
  {
    id: 3,
    text: "Staking",
    link: "/",
  },
  {
    id: 4,
    text: "Blog",
    link: "https://medium.com/@KangaDegens",
  },
  {
    id: 5,
    text: "Founder",
    link: "https://medium.com/@KangaDegens/team-of-roo-finance-6aab1398712",
  },
];

class Footer extends Component {
  state = {
    data: {},
    socialData: [],
    widgetData: [],
  };
  componentDidMount() {
    axios
      .get(`${BASE_URL}`)
      .then((res) => {
        this.setState({
          data: res.data,
          socialData: res.data.socialData,
          widgetData: res.data.widgetData,
        });
        // console.log(this.state.data)
      })
      .catch((err) => console.log(err));
  }
  render() {
    return (
      <footer className="footer-area">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 text-center">
              {/* Footer Items */}
              <div className="footer-items">
                {/* Logo */}
                <Link to="https://roo.finance" className="navbar-brand">
                  <img src={this.state.data.img} alt="" />
                </Link>
                {/* Social Icons */}
                <div className="social-icons d-flex justify-content-center my-4">
                  {this.state.socialData.map((item, idx) => {
                    return (
                      <a
                        key={`fsd_${idx}`}
                        className="facebook"
                        href={item.link}
                        target="_blank"
                      >
                        <i className={item.icon} />
                        <i className={item.icon} />
                      </a>
                    );
                  })}
                </div>
                <ul className="list-inline">
                  {widgetData.map((item, idx) => {
                    // console.log("item.link", item.link);
                    return (
                      <li key={`fwd_${idx}`} className="list-inline-item">
                        {item.text == "Blog" || item.text == "Roadmap" ? (
                          <a href={item.link}>{item.text}</a>
                        ) : (
                          <Link to={item.link}>{item.text}</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {/* Copyright Area */}
                <div className="copyright-area py-4">
                  {this.state.data.copyright}{" "}
                  <a href={this.state.data.ownerLink} target="_blank">
                    {this.state.data.owner}
                  </a>
                </div>
              </div>
              {/* Scroll To Top */}
              <div id="scroll-to-top" className="scroll-to-top">
                <a href="#header" className="smooth-anchor">
                  <i className="fa-solid fa-arrow-up" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
