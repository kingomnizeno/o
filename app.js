
window.onload = () => {
  const connectButton = document.getElementById("connect-button");

  connectButton.addEventListener("click", async () => {
    if ('solana' in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        try {
          const res = await provider.connect();
          alert('Connected to wallet: ' + res.publicKey.toString());
        } catch (err) {
          console.error("Connection error:", err);
        }
      }
    } else {
      alert("Please install Phantom Wallet!");
    }
  });
};
