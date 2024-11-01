import React from "react";
import Wallet from "./components/Wallet";

const App = () => {
  return (
    <div className="example-div">
      <div className="head-title">NFT Demo</div>
      <hr style={{ borderTop: "1px solid", width: "100%" }} />
      <div className="example-row">
        <Wallet />
      </div>
    </div>
  );
};

export default App;
