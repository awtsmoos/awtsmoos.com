// B"H

const SKIP = new Set([
  "node_modules",
  ".git",
  ".DS_Store",
  "dist",
  "build",
  ".next",
  "coverage"
]);

const SECRET_FILES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".npmrc",
  "id_rsa",
  "id_dsa",
  "id_ed25519",
  "credentials.json"
]);

const BIN = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".pdf", ".zip", ".exe", ".dll", ".so", ".node",
  ".woff", ".woff2", ".ttf",
  ".mp4", ".mov", ".mp3"
]);

module.exports = {
  SKIP,
  SECRET_FILES,
  BIN
};