const express = require("express");
const router = express.Router();
const { saveTransaction, processTokenPayment } = require("../utils/moralis");
const { verify2FA } = require("../utils/twofa");

router.post('/send-payment', async (req, res) => {
  const { userId, token, amount, toAddress } = req.body;
  
  // Validate 2FA before sending payment
  const is2FAValid = verify2FA(userId, token);
  if (!is2FAValid) {
    return res.status(400).json({ success: false, message: "Invalid 2FA code" });
  }

  // Process payment and send tokens
  try {
    const txHash = await processTokenPayment(userId, amount, toAddress);
    // Save transaction history
    await saveTransaction({ userAddress: toAddress, transactionHash: txHash });
    
    res.json({ success: true, message: `Payment of ${amount} sent to ${toAddress}`, transactionHash: txHash });
  } catch (error) {
    console.error("Payment failed:", error);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
});

module.exports = router;
