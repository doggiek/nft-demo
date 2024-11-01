import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Button,
  List,
  Typography,
  Tooltip,
  Avatar,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import dayjs from "dayjs";
import { CopyOutlined } from "@ant-design/icons";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import DoggieKArtifact from "../static/contracts/DoggieKToken.json";
import DoggieKAddress from "../static/address/DoggieKTokenAddress.json";

const { Title } = Typography;
const { Option } = Select;

// 合约地址和ABI
const nftAddress = DoggieKAddress.local;
const nftABI = DoggieKArtifact.abi;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const Wallet = () => {
  const [provider, setProvider] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _contract = new ethers.Contract(nftAddress, nftABI, _provider);
        setProvider(_provider);
        setNftContract(_contract);
      }
    };

    initialize();
  }, []);

  const connectWallet = async () => {
    checkMetamaskInstallation();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("accounts: " + JSON.stringify(accounts));
      const currentAccount = accounts[0];
      setCurrentAccount(currentAccount);
      setProvider(provider);

      const contract = new ethers.Contract(nftAddress, nftABI, provider);
      setNftContract(contract);

      getBalance(currentAccount);
      fetchNFTs(currentAccount);
    } catch (error) {
      console.log(error);
    }
  };

  // 钱包是否安装
  const checkMetamaskInstallation = () => {
    if (window.ethereum === undefined) {
      alert("Metamask wallet is not installed! Install please");
      return;
    }
  };

  // 查余额
  const getBalance = async (_account) => {
    if (nftContract) {
      const signer = await provider.getSigner();
      let contractWithSigner = nftContract.connect(signer);
      const balance = await contractWithSigner.balanceOf(_account);
      setCurrentBalance(Number(balance));
    }
  };

  // 查NFT列表
  const fetchNFTs = async (_account) => {
    const nfts = [];
    const signer = await provider.getSigner();
    let contractWithSigner = nftContract.connect(signer);
    const balance = await contractWithSigner.balanceOf(_account);
    for (let i = 0; i < balance; i++) {
      const tokenId = await contractWithSigner.tokenOfOwnerByIndex(_account, i);
      const tokenURI = await contractWithSigner.tokenURI(tokenId);
      const creator = await contractWithSigner.getCreator(tokenId);
      const creationTime = await contractWithSigner.getCreationTime(tokenId);
      nfts.push({
        tokenId: tokenId.toString(),
        tokenURI: tokenURI.toString(),
        creator: creator,
        creationTime: creationTime,
      });
    }
    setNfts(nfts);
  };

  // feat复制
  const CopyText = ({ text }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // 2秒后重置状态
        })
        .catch((err) => console.error("复制失败:", err));
    };
    return (
      <Tooltip title={isCopied ? "已复制" : "复制地址"} placement="top">
        <CopyOutlined
          onClick={handleCopy}
          style={{
            color: isCopied ? "#1890ff" : "#999", // 复制后颜色
            cursor: "pointer",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1890ff")} // hover 颜色
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = isCopied ? "#1890ff" : "#999")
          } // 还原颜色
        />
      </Tooltip>
    );
  };

  // 随机生成URI
  const avatar = createAvatar(lorelei, {
    seed: "Felix",
  });
  const dataUri = avatar.toDataUri();

  // mint表单
  const MintForm = () => {
    const [form] = Form.useForm();
    // const [isFormValid, setIsFormValid] = useState(false);

    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const tailLayout = {
      wrapperCol: { offset: 6, span: 14 },
    };

    // mint（先给自己挖）
    const mintNFT = async (address, uri) => {
      // 在这里处理铸造 NFT 的逻辑
      console.log("Minting NFT to:", address, "with URI:", uri);
      if (nftContract) {
        const signer = await provider.getSigner();
        let contractWithSigner = nftContract.connect(signer);
        const tx = await contractWithSigner.safeMint(address, uri);
        await tx.wait();
        fetchNFTs(currentAccount);
        getBalance(currentAccount);
      }
    };

    const onFinish = (values) => {
      // 提交成功时的处理
      const { address, uri } = values; // 从表单中获取数据
      mintNFT(address, uri); // 调用 mintNFT 函数
    };

    // const onValuesChange = (changedValues) => {
    //   // 检查表单有效性
    //   const errors = form
    //     .getFieldsError()
    //     .filter(({ errors }) => errors.length);
    //   setIsFormValid(errors.length === 0);
    // };

    return (
      <Form
        form={form}
        id="mintForm"
        {...layout}
        name="control-hooks"
        onFinish={onFinish} // 绑定onFinish事件
        // onValuesChange={onValuesChange} // 监听值变化
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="address"
          label="地址"
          rules={[{ required: true, message: "请输入地址!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="uri"
          label="URI"
          rules={[{ required: true, message: "请输入 URI!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              // disabled={!!!isFormValid}
            >
              铸造 NFT
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>NFT 钱包</h2>
      {!!!currentAccount ? (
        <Button type="primary" size="large" onClick={connectWallet}>
          连接 MetaMask
        </Button>
      ) : (
        <ul>
          <li>
            当前账户: {currentAccount} <CopyText text={currentAccount} />
          </li>
          <li>拥有的 NFT 数量: {currentBalance}</li>
        </ul>
      )}

      <h2>挖币</h2>
      {!!!currentAccount ? (
        <div>
          <p>请先连接 MetaMask 钱包</p>
        </div>
      ) : (
        <div>
          {/* <Button type="primary" onClick={mintNFT}>
            铸造 NFT
          </Button> */}
          <MintForm></MintForm>
        </div>
      )}

      <h2>我的 NFT</h2>
      <List
        bordered
        itemLayout="horizontal"
        dataSource={nfts}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.tokenURI} />}
              title={<span>Token ID: {item.tokenId}</span>}
              description={
                <span>
                  <Tooltip title="创作者" placement="top">
                    {item.creator}
                  </Tooltip>
                  &nbsp;·&nbsp;
                  <Tooltip title="铸造时间" placement="top">
                    {dayjs(Number(item.creationTime) * 1000).format(
                      "YYYY年MM月DD日 HH:mm:ss"
                    )}
                  </Tooltip>
                </span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Wallet;
