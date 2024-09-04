const express = require("express");
const { generate2FA, validate2FA } = require("../utils/twofa");

const router = express.Router();

// Generate 2FA secret and QR code
router.post('/generate-2fa', generate2FA);

// Validate 2FA code
router.post('/validate-2fa', validate2FA);

module.exports = router;
