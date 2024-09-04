const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

let userDatabase = {};

const generate2FA = (req, res) => {
  const { userId } = req.body;

  const secret = speakeasy.generateSecret({ name: "Send Me Hugs Wallet" });

  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) return res.status(500).json({ error: "Error generating QR code" });

    // Save the secret associated with the user
    userDatabase[userId] = { ...userDatabase[userId], twoFaSecret: secret.base32 };

    res.json({ secret: secret.base32, qrCodeUrl: data_url });
  });
};

const validate2FA = (req, res) => {
  const { userId, token } = req.body;

  const user = userDatabase[userId];
  if (!user || !user.twoFaSecret) {
    return res.status(400).json({ valid: false, message: "2FA not set up" });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFaSecret,
    encoding: 'base32',
    token: token
  });

  if (verified) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
};

const verify2FA = (userId, token) => {
  const user = userDatabase[userId];
  if (!user || !user.twoFaSecret) return false;

  return speakeasy.totp.verify({
    secret: user.twoFaSecret,
    encoding: 'base32',
    token: token
  });
};

module.exports = { generate2FA, validate2FA, verify2FA };
