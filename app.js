
document.getElementById("connect-button").addEventListener("click", async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const res = await window.solana.connect();
      alert("Connected: " + res.publicKey.toString());
    } catch (err) {
      console.error("Connection error:", err);
    }
  } else {
    alert("Please install Phantom Wallet!");
  }
});

// Placeholder: Jupiter API integration will go here
document.getElementById("swap-button").addEventListener("click", () => {
  alert("Swap logic with Jupiter API will go here.");
});
