const { generateKeyPairSync } = require("crypto");
const fs = require("fs");

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

fs.writeFileSync("private.key", privateKey);
fs.writeFileSync("public.key", publicKey);

console.log("Keys generated!");