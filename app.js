let wallet = null;

async function connectWallet() {
  if ('solana' in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      try {
        const resp = await provider.connect();
        wallet = provider;
        alert("Connected to wallet: " + resp.publicKey.toString());
        loadTokens();
      } catch (err) {
        console.error(err);
      }
    }
  } else {
    alert("Phantom wallet not found!");
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

  // Default: SOL ⇄ USDT
  fromSelect.value = tokens.find(t => t.symbol === "SOL").address;
  toSelect.value = tokens.find(t => t.symbol === "USDT").address;
}

document.getElementById("swap-button").addEventListener("click", async () => {
  alert("Swap logic with Jupiter API will go here.");
});
