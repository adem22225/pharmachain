const CONTRACT_ADDRESS = "0xa46B6f96e5D1B71d977fEF9Fb9845B6e208E4433";

const CONTRACT_ABI = [
  {
    "inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],
    "name":"verifyProduct",
    "outputs":[
      {"internalType":"string","name":"name","type":"string"},
      {"internalType":"string","name":"batchNumber","type":"string"},
      {"internalType":"address","name":"currentOwner","type":"address"},
      {"internalType":"uint8","name":"state","type":"uint8"},
      {"internalType":"uint256","name":"expiryDate","type":"uint256"}
    ],
    "stateMutability":"view",
    "type":"function"
  }
];

const STATUS_MAP = [
  "Created",
  "In Transit",
  "Delivered",
  "Recalled"
];

const web3 = new Web3(
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
);

const contract = new web3.eth.Contract(
  CONTRACT_ABI,
  CONTRACT_ADDRESS
);

async function verifyProduct() {

  _clearResults();

  const rawId = document
    .getElementById("productId")
    .value
    .trim();

  if (!rawId || isNaN(rawId)) {

    _showError("Please enter a valid Product ID");

    return;
  }

  const productId = parseInt(rawId);

  _setTxStatus(
    "pending",
    "Reading data from blockchain..."
  );

  try {

    const result = await contract.methods
      .verifyProduct(productId)
      .call();

    const name        = result[0];
    const batchNumber = result[1];
    const owner       = result[2];
    const statusIdx   = parseInt(result[3]);
    const expiryTs    = parseInt(result[4]);

    if (!name || name === "") {

      throw new Error("Product not found");
    }

    const statusLabel =
      STATUS_MAP[statusIdx] || "Unknown";

    const expiryDate =
      _formatDate(expiryTs);

    _renderProduct({
      productId,
      name,
      batchNumber,
      owner,
      statusLabel,
      statusIdx,
      expiryDate
    });

    _renderQR({
      productId,
      name,
      batchNumber,
      statusLabel
    });

    _setTxStatus(
      "success",
      "Product verified successfully ✓"
    );

  } catch (err) {

    _setTxStatus(
      "error",
      "Verification failed"
    );

    _showError(
      "Product not found on blockchain"
    );
  }
}

function _renderProduct({
  productId,
  name,
  batchNumber,
  owner,
  statusLabel,
  statusIdx,
  expiryDate
}) {

  document.getElementById("pName").textContent =
    name;

  document.getElementById("pBatch").textContent =
    batchNumber;

  document.getElementById("pOwner").textContent =
    owner;

  document.getElementById("pExpiry").textContent =
    expiryDate;

  const badge =
    document.getElementById("pStatusBadge");

  badge.textContent = statusLabel;

  badge.className =
    "status-badge status-" +
    statusLabel.replace(/\s/g, "");

  for (let i = 0; i < 4; i++) {

    const el =
      document.getElementById("lc-" + i);

    el.classList.remove("active", "done");

    if (i < statusIdx)
      el.classList.add("done");

    if (i === statusIdx)
      el.classList.add("active");
  }

  document
    .getElementById("productResult")
    .classList
    .add("show");
}

function _renderQR({
  productId,
  name,
  batchNumber,
  statusLabel
}) {

  const qrData = `
Product ID: ${productId}
Name: ${name}
Batch: ${batchNumber}
Status: ${statusLabel}
`;

  const qrDiv =
    document.getElementById("qrcode");

  qrDiv.innerHTML = "";

  new QRCode(qrDiv, {
    text: qrData,
    width: 200,
    height: 200
  });

  document.getElementById("qrData").textContent =
    qrData;

  document.getElementById("qrLabel").textContent =
    `Product #${productId} — ${name}`;

  document
    .getElementById("qrCard")
    .classList
    .add("show");
}

function _setTxStatus(type, msg) {

  const el =
    document.getElementById("txStatus");

  const spinner =
    document.getElementById("txSpinner");

  const text =
    document.getElementById("txMsg");

  el.className = "show " + type;

  text.textContent = msg;

  spinner.style.display =
    type === "pending"
    ? "block"
    : "none";
}

function _showError(msg) {

  document.getElementById("errorMsg").textContent =
    msg;

  document
    .getElementById("errorBox")
    .classList
    .add("show");
}

function _clearResults() {

  document
    .getElementById("txStatus")
    .classList
    .remove("show");

  document
    .getElementById("errorBox")
    .classList
    .remove("show");

  document
    .getElementById("productResult")
    .classList
    .remove("show");

  document
    .getElementById("qrCard")
    .classList
    .remove("show");

  document.getElementById("qrcode").innerHTML = "";
}

function _formatDate(ts) {

  if (!ts || ts === 0)
    return "N/A";

  const d = new Date(ts * 1000);

  return d.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}