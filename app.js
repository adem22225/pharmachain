const CONTRACT_ADDRESS = "0xa46B6f96e5D1B71d977fEF9Fb9845B6e208E4433";

const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "confirmDelivery",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "ProductRecalled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "ProductRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "recallProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_batch",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_expiryDate",
				"type": "uint256"
			}
		],
		"name": "registerProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "transferProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "products",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "batchNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "currentOwner",
				"type": "address"
			},
			{
				"internalType": "enum PharmaSupplyChain.State",
				"name": "state",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "verifyProduct",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "batchNumber",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "currentOwner",
				"type": "address"
			},
			{
				"internalType": "enum PharmaSupplyChain.State",
				"name": "state",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let web3        = null;
let contract    = null;
let userAccount = null;

const STATUS_MAP = ["Created", "InTransit", "Delivered", "Recalled"];

window.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) await _setupWeb3(accounts[0]);
    } catch (_) {}

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) _disconnect();
      else _setupWeb3(accounts[0]);
    });

    window.ethereum.on("chainChanged", () => window.location.reload());
  }
});

async function connectWallet() {
  if (!window.ethereum) {
    _showError("MetaMask is not installed. Please install the MetaMask browser extension.");
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    await _setupWeb3(accounts[0]);
  } catch (err) {
    if (err.code === 4001) {
      _showError("Connection rejected. Please approve MetaMask connection.");
    } else {
      _showError("Failed to connect: " + err.message);
    }
  }
}

async function _setupWeb3(account) {
  web3        = new Web3(window.ethereum);
  userAccount = account;
  contract    = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

  const chainId = await web3.eth.getChainId();
  if (chainId !== 11155111) {
    _showError("Wrong network. Please switch MetaMask to the Sepolia testnet.");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (_) {}
    return;
  }

  const short = account.slice(0, 6) + "…" + account.slice(-4);
  document.getElementById("walletDot").classList.add("connected");
  document.getElementById("walletBtnText").textContent = "Connected";
  document.getElementById("walletAddr").textContent    = short;
  document.getElementById("walletAddr").style.display  = "block";
}

function _disconnect() {
  web3        = null;
  contract    = null;
  userAccount = null;
  document.getElementById("walletDot").classList.remove("connected");
  document.getElementById("walletBtnText").textContent = "Connect MetaMask";
  document.getElementById("walletAddr").style.display  = "none";
}

async function verifyProduct() {
  _clearResults();

  if (!web3 || !contract) {
    _showError("Please connect your MetaMask wallet first.");
    return;
  }

  const rawId = document.getElementById("productId").value.trim();
  if (!rawId || isNaN(rawId) || Number(rawId) <= 0) {
    _showError("Please enter a valid positive numeric Product ID.");
    return;
  }

  const productId = parseInt(rawId, 10);
  _setTxStatus("pending", "Querying smart contract on Sepolia…");
  document.getElementById("verifyBtn").disabled = true;

  try {
    const result = await contract.methods.verifyProduct(productId).call();

    const name        = result[0];
    const batchNumber = result[1];
    const owner       = result[2];
    const statusIdx   = parseInt(result[3], 10);
    const expiryTs    = parseInt(result[4], 10);

    if (!name || name === "") throw new Error("Product not found on the blockchain.");

    const expiryDate  = _formatDate(expiryTs);
    const statusLabel = STATUS_MAP[statusIdx] || "Unknown";

    _renderProduct({ productId, name, batchNumber, owner, statusLabel, statusIdx, expiryDate });
    _renderQR({ productId, name, batchNumber, owner, statusLabel, expiryDate });
    _setTxStatus("success", "Product successfully verified on-chain ✓");

  } catch (err) {
    _setTxStatus("error", "Verification failed.");
    _showError(_parseError(err));
  } finally {
    document.getElementById("verifyBtn").disabled = false;
  }
}

function _renderProduct({ productId, name, batchNumber, owner, statusLabel, statusIdx, expiryDate }) {
  document.getElementById("pName").textContent   = name;
  document.getElementById("pBatch").textContent  = batchNumber;
  document.getElementById("pOwner").textContent  = owner;
  document.getElementById("pExpiry").textContent = expiryDate;

  const badge = document.getElementById("pStatusBadge");
  badge.textContent = statusLabel;
  badge.className   = "status-badge status-" + statusLabel.replace(/\s/g, "");

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById("lc-" + i);
    el.classList.remove("active", "done");
    if (i < statusIdx)   el.classList.add("done");
    if (i === statusIdx) el.classList.add("active");
  }

  document.getElementById("productResult").classList.add("show");
}

function _renderQR({ productId, name, batchNumber, owner, statusLabel, expiryDate }) {
  const qrData = `
Product ID: ${productId}
Name: ${name}
Batch: ${batchNumber}
Status: ${statusLabel}
`;
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";

  new QRCode(qrDiv, {
    text:         qrData,
    width:        200,
    height:       200,
    colorDark:    "#0a1f5c",
    colorLight:   "#f0f6ff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  document.getElementById("qrData").textContent  = qrData;
  document.getElementById("qrLabel").textContent = `Product #${productId} — ${name}`;
  document.getElementById("qrCard").classList.add("show");
}

function _setTxStatus(type, msg) {
  const el      = document.getElementById("txStatus");
  const spinner = document.getElementById("txSpinner");
  const text    = document.getElementById("txMsg");

  el.className            = "show " + type;
  text.textContent        = msg;
  spinner.style.display   = type === "pending" ? "block" : "none";
}

function _showError(msg) {
  document.getElementById("errorMsg").textContent = msg;
  document.getElementById("errorBox").classList.add("show");
}

function _clearResults() {
  document.getElementById("txStatus").classList.remove("show");
  document.getElementById("errorBox").classList.remove("show");
  document.getElementById("productResult").classList.remove("show");
  document.getElementById("qrCard").classList.remove("show");
  document.getElementById("qrcode").innerHTML = "";
}

function _formatDate(ts) {
  if (!ts || ts === 0) return "N/A";
  const d = new Date(ts * 1000);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function _parseError(err) {
  const msg = err?.message || err?.toString() || "Unknown error";
  if (msg.includes("Product not found"))   return "Product not found on the blockchain. Check the Product ID and try again.";
  if (msg.includes("execution reverted"))  return "Contract reverted: " + (msg.split("execution reverted:")[1] || "Product may not exist.");
  if (msg.includes("cannot read"))         return "Unexpected contract response. Check the contract address.";
  if (msg.includes("network"))             return "Network error. Ensure MetaMask is on Sepolia testnet.";
  return msg.length > 150 ? msg.slice(0, 150) + "…" : msg;
}