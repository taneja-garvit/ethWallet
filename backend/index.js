const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3001;

// Middleware setup
app.use(cors());
app.use(express.json());

// Define routes before starting the server
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);

app.get("/getTokens", async (req, res) => {
  const { userAddress, chain } = req.query;

  try {
    const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: chain,
      address: userAddress,
    });

    const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: chain,
      address: userAddress,
      mediaItems: true,
    });

    const myNfts = nfts.raw.result.map((e) => {
      if (e?.media?.media_collection?.high?.url && !e.possible_spam && (e?.media?.category !== "video")) {
        return e["media"]["media_collection"]["high"]["url"];
      }
    });

    const balance = await Moralis.EvmApi.balance.getNativeBalance({
      chain: chain,
      address: userAddress
    });

    const jsonResponse = {
      tokens: tokens.raw,
      nfts: myNfts,
      balance: balance.raw.balance / (10 ** 18)
    };

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls on port ${port}`);
  });
});
