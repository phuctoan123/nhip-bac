#!/usr/bin/env node
const crypto = require("crypto");
const readline = require("readline");

const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
};

function createHash(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, 64, SCRYPT_OPTIONS);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

function promptPassword() {
  return new Promise((resolve) => {
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    input.question("Nhập mật khẩu Admin: ", (password) => {
      input.close();
      resolve(password);
    });
  });
}

(async () => {
  const password = process.argv[2] || await promptPassword();
  if (!password) {
    console.error("Mật khẩu không được để trống.");
    process.exitCode = 1;
    return;
  }
  console.log(createHash(password));
})();
