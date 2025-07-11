
let wallet = null;

async function connectWallet() {
  if ('solana' in window && window.solana.isPhantom) {
    try {
      const res = await window.solana.connect();
      wallet = window.solana;
      document.getElementById("status").innerText = "Wallet connected: " + res.publicKey.toString();
      loadTokens();
    } catch (err) {
      console.error(err);
    }
  } else {
    alert("Phantom Wallet not found!");
  }
}

document.getElementById("connect-button").addEventListener("click", connectWallet);

async function loadTokens() {
  const fromSelect = document.getElementById("from-token");
  const toSelect = document.getElementById("to-token");

  const response = await fetch("https://cache.jup.ag/tokens");
  const tokens = await response.json();

  tokens.forEach(token => {
    const optionA = document.createElement("option");
    optionA.value = token.address;
    optionA.text = token.symbol;
    fromSelect.appendChild(optionA);

    const optionB = document.createElement("option");
    optionB.value = token.address;
    optionB.text = token.symbol;
    toSelect.appendChild(optionB);
  });

  fromSelect.value = tokens.find(t => t.symbol === "SOL").address;
  toSelect.value = tokens.find(t => t.symbol === "USDT").address;
}

document.getElementById("swap-button").addEventListener("click", async () => {
  const from = document.getElementById("from-token").value;
  const to = document.getElementById("to-token").value;
  const amount = document.getElementById("amount").value;
  const slippage = document.getElementById("slippage").value;

  if (!wallet || !wallet.publicKey) {
    alert("Please connect your wallet first.");
    return;
  }

  document.getElementById("status").innerText = "Fetching best route...";

  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${from}&outputMint=${to}&amount=${Math.floor(amount * 1e9)}&slippageBps=${slippage * 100}`;

  const quoteRes = await fetch(quoteUrl);
  const quote = await quoteRes.json();

  if (!quote || !quote.data || quote.data.length === 0) {
    document.getElementById("status").innerText = "No route found.";
    return;
  }

  document.getElementById("status").innerText = `Best route: ${quote.data[0].outAmount / 1e6} tokens`;
});
