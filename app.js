const CONTRACT_ADDRESS = "0xD327A64b0fa9C9BbB44B6FFdDF0f432712B4452C";

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
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
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
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "deliveredTo",
				"type": "address"
			}
		],
		"name": "ProductDelivered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
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
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
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
const STATUS = ["Created","InTransit","Delivered","Recalled"];
const STATUS_LABELS = ["Created","In Transit","Delivered","Recalled"];

let web3 = null;
let contract = null;
let account = null;

window.addEventListener("DOMContentLoaded", async () => {
	web3 = new Web3(
  "https://ethereum-sepolia-rpc.publicnode.com"
);

contract = new web3.eth.Contract(
  CONTRACT_ABI,
  CONTRACT_ADDRESS
);
  document.getElementById("cAddr").textContent = CONTRACT_ADDRESS;
});



async function setupWeb3(acc) {
  account = acc;
  const chainId = await web3.eth.getChainId();
  if (chainId !== 11155111) {
    showErr("Wrong network — please switch MetaMask to Sepolia Testnet.");
    try {
      await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0xaa36a7"}]});
    } catch(_) {}
    return;
  }
  const short = acc.slice(0,6) + "…" + acc.slice(-4);
  document.getElementById("wDot").classList.add("on");
  document.getElementById("wTxt").textContent = "Connected";
  const wAddr = document.getElementById("wAddr");
  wAddr.textContent = short;
  wAddr.style.display = "block";
  wAddr.style.fontSize = "0.76rem";
  wAddr.style.color = "var(--muted)";
  wAddr.style.fontFamily = "var(--mono)";
}

function disconnect() {
  web3 = null; contract = null; account = null;
  document.getElementById("wDot").classList.remove("on");
  document.getElementById("wTxt").textContent = "Connect MetaMask";
  document.getElementById("wAddr").style.display = "none";
}

async function verifyProduct() {
  clearAll();
  const raw = document.getElementById("productId").value.trim();
  if (!raw || isNaN(raw) || Number(raw) <= 0) { showErr("Enter a valid positive Product ID."); return; }
  const id = parseInt(raw, 10);
  setTx("pending", "Querying blockchain…");
  document.getElementById("verifyBtn").disabled = true;
  try {
    const r = await contract.methods.verifyProduct(id).call();
    const name = r[0]; const batch = r[1]; const owner = r[2];
    const statusIdx = parseInt(r[3], 10); const expiryTs = parseInt(r[4], 10);
    if (!name || name === "") throw new Error("Product not found on the blockchain.");
    const expiry = fmtDate(expiryTs);
    const statusKey = STATUS[statusIdx] || "Unknown";
    const statusLabel = STATUS_LABELS[statusIdx] || "Unknown";
    renderProduct({id, name, batch, owner, statusKey, statusLabel, statusIdx, expiry});
    renderQR({id, name, batch, owner, statusLabel, expiry});
    await loadEvents(id, statusKey);
    setTx("ok", "Product verified successfully on-chain ✓");
  } catch(e) {
    setTx("err", "Verification failed.");
    showErr(parseErr(e));
  } finally {
    document.getElementById("verifyBtn").disabled = false;
  }
}

function renderProduct({id, name, batch, owner, statusKey, statusLabel, statusIdx, expiry}) {
  document.getElementById("pName").textContent = name;
  document.getElementById("pId").textContent = "Product ID: #" + id;
  document.getElementById("pBatch").textContent = batch;
  document.getElementById("pExpiry").textContent = expiry;
  document.getElementById("pOwner").textContent = owner;
  const badge = document.getElementById("pBadge");
  badge.textContent = statusLabel;
  badge.className = "badge badge-" + statusKey;
  renderLifecycle(statusIdx, statusKey);
  document.getElementById("resultArea").classList.add("show");
}

function renderLifecycle(idx, key) {
  const steps = ["lc0","lc1","lc2","lc3"];
  const progMap = {0:8, 1:40, 2:92, 3:92};
  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove("done","active","recalled");
    if (key === "Recalled" && i === 3) { el.classList.add("recalled"); }
    else if (i < idx) el.classList.add("done");
    else if (i === idx && key !== "Recalled") el.classList.add("active");
  });
  document.getElementById("lcProgress").style.width = (progMap[idx] || 0) + "%";
}

function renderQR({id, name, batch, owner, statusLabel, expiry}) {
  const payload = JSON.stringify({
    system:"PharmaChain",
    productId:id,
    name, batch, owner,
    status:statusLabel,
    expiry,
    contract:CONTRACT_ADDRESS,
    network:"Sepolia",
    verifiedAt:new Date().toISOString()
  });
  const box = document.getElementById("qrBox");
  box.innerHTML = "";
  new QRCode(box, {
    text: payload,
    width: 200, height: 200,
    colorDark: "#071230",
    colorLight: "#e2eaff",
    correctLevel: QRCode.CorrectLevel.H
  });
  document.getElementById("qrSub").textContent = "Product #" + id + " — " + name;
  document.getElementById("qrData").textContent = payload;
  document.getElementById("qrCard").classList.add("show");
}

async function loadEvents(productId, statusKey) {
  const tl = document.getElementById("timeline");
  tl.innerHTML = `<div class="tl-empty"><div class="tl-empty-icon" style="font-size:1rem">⏳</div>Loading blockchain events…</div>`;
  document.getElementById("eventCount").textContent = "Loading…";
  try {
    const from = 0;
    const events = [];
    const latest = await web3.eth.getBlockNumber();
	const fromBlock = Math.max(latest - 50000, 0);

const logs = await web3.eth.getPastLogs({
  address: CONTRACT_ADDRESS,
  fromBlock: fromBlock,
  toBlock: latest
});

console.log(logs);


events.push(...logs);
    
    events.sort((a,b) => a.blockNumber - b.blockNumber);
    document.getElementById("eventCount").textContent = events.length + " event" + (events.length !== 1 ? "s" : "") + " found";
    if (events.length === 0) {
      tl.innerHTML = `<div class="tl-empty"><div class="tl-empty-icon">📭</div>No blockchain events found for this product ID</div>`;
      return;
    }
    tl.innerHTML = "";
    for (const [i, ev] of events.entries()) {
		const block = await web3.eth.getBlock(ev.blockNumber);
const time = new Date(block.timestamp * 1000)
  .toLocaleString();
      const isLast = i === events.length - 1;
      const cfg = eventConfig(ev._name, ev.returnValues);
      const item = document.createElement("div");
      item.className = "tl-item";
      item.style.animationDelay = (i * 0.08) + "s";
      item.innerHTML = `
        <div class="tl-left">
          <div class="tl-icon ${cfg.cls}">${cfg.icon}</div>
          ${!isLast ? '<div class="tl-line-seg"></div>' : ''}
        </div>
        <div class="tl-body">
          <div class="tl-event">${cfg.label}</div>
          <div class="tl-meta">
            <span>Block #${ev.blockNumber}</span>
			<span>${time}</span>
            <span class="tl-tx" onclick="openTx('${ev.transactionHash}')">${ev.transactionHash.slice(0,12)}…${ev.transactionHash.slice(-6)}</span>
            ${cfg.detail ? '<span>' + cfg.detail + '</span>' : ''}
          </div>
        </div>`;
      tl.appendChild(item);
    }
  } catch(e) {
	console.log(e);
    document.getElementById("eventCount").textContent = "Could not load events";
    tl.innerHTML = `<div class="tl-empty"><div class="tl-empty-icon">⚠</div>Event log unavailable — check contract address and network</div>`;
  }
}

function eventConfig(name, vals) {
  const cfg = {
    ProductRegistered:   {cls:"registered", icon:"🏭", label:"Product Registered on Blockchain", detail: vals.manufacturer ? "By: " + short(vals.manufacturer) : ""},
    OwnershipTransferred:{cls:"transferred", icon:"🔄", label:"Ownership Transferred", detail: vals.from && vals.to ? short(vals.from) + " → " + short(vals.to) : ""},
    ProductDelivered:    {cls:"delivered",   icon:"✅", label:"Delivery Confirmed", detail: vals.deliveredTo ? "To: " + short(vals.deliveredTo) : ""},
    ProductRecalled:     {cls:"recalled",    icon:"🚨", label:"Product Recalled", detail:""}
  };
  return cfg[name] || {cls:"", icon:"📌", label:name, detail:""};
}

function short(addr) { return addr ? addr.slice(0,6) + "…" + addr.slice(-4) : ""; }
function openTx(hash) { window.open("https://sepolia.etherscan.io/tx/" + hash, "_blank"); }

function setTx(type, msg) {
  const bar = document.getElementById("txBar");
  const spin = document.getElementById("txSpin");
  const txt = document.getElementById("txMsg");
  bar.className = "status-bar show " + type;
  txt.textContent = msg;
  spin.style.display = type === "pending" ? "block" : "none";
}

function showErr(msg) {
  document.getElementById("errMsg").textContent = msg;
  document.getElementById("errBox").classList.add("show");
}

function clearAll() {
  document.getElementById("txBar").classList.remove("show");
  document.getElementById("errBox").classList.remove("show");
  document.getElementById("resultArea").classList.remove("show");
  document.getElementById("qrCard").classList.remove("show");
  document.getElementById("qrBox").innerHTML = "";
  document.getElementById("timeline").innerHTML = `<div class="tl-empty"><div class="tl-empty-icon">⛓</div>Verify a product to load its blockchain event history</div>`;
  document.getElementById("eventCount").textContent = "No events loaded";
}

function fmtDate(ts) {
  if (!ts || ts === 0) return "N/A";
  const d = new Date(ts * 1000);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric"});
}

function parseErr(e) {
  const m = e?.message || e?.toString() || "Unknown error";
  if (m.includes("Product not found")) return "Product not found on the blockchain. Verify the ID and try again.";
  if (m.includes("execution reverted")) return "Contract reverted: " + (m.split("execution reverted:")[1] || "Product may not exist.");
  if (m.includes("network")) return "Network error — ensure MetaMask is on Sepolia testnet.";
  return m.length > 160 ? m.slice(0, 160) + "…" : m;
}