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
  const amount = parseFloat(document.getElementById("amount").value);
  const slippage = parseFloat(document.getElementById("slippage").value);

  if (!wallet || !wallet.publicKey || isNaN(amount) || amount <= 0) {
    alert("Connect your wallet and enter a valid amount.");
    return;
  }

  const inputAmount = Math.floor(amount * 1e9);
  const status = document.getElementById("status");
  status.innerText = "Getting route...";

  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${from}&outputMint=${to}&amount=${inputAmount}&slippageBps=${slippage * 100}`;
  const quoteRes = await fetch(quoteUrl);
  const quote = await quoteRes.json();

  if (!quote.data || quote.data.length === 0) {
    status.innerText = "No route found.";
    return;
  }

  const route = quote.data[0];
  status.innerText = "Building swap transaction...";

  const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route,
      userPublicKey: wallet.publicKey.toString(),
      wrapUnwrapSOL: true,
      feeAccount: null
    })
  });

  const swapData = await swapRes.json();
  const txBuf = Buffer.from(swapData.swapTransaction, "base64");
  const transaction = solanaWeb3.Transaction.from(txBuf);
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = (await new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"))).getLatestBlockhash().blockhash;

  status.innerText = "Signing and sending...";

  const signed = await wallet.signTransaction(transaction);
  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
  const txid = await connection.sendRawTransaction(signed.serialize());

  status.innerHTML = `✅ Transaction sent! <a href='https://solscan.io/tx/${txid}' target='_blank'>View on Solscan</a>`;
});