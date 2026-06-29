#!/usr/bin/env node
// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");
const https = require("https");

const DEFAULT_URL = "https://huggingface.co/tensorblock/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0-Q2_K.gguf";
const DEFAULT_DIR = path.join(os.homedir(), "Documents", "awtai-db-models");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        file.close(); fs.unlinkSync(dest);
        return download(response.headers.location, dest).then(resolve, reject);
      }
      if (response.statusCode !== 200) return reject(new Error("HTTP " + response.statusCode + " for " + url));
      const total = Number(response.headers["content-length"] || 0);
      let done = 0;
      response.on("data", chunk => {
        done += chunk.length;
        if (total) process.stdout.write("\rB'H Download " + Math.floor(done / total * 100) + "%");
      });
      response.pipe(file);
      file.on("finish", () => file.close(() => { console.log("\nB'H Saved " + dest); resolve(dest); }));
    }).on("error", reject);
  });
}

async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  const name = path.basename(url.split("?")[0]);
  const dest = process.argv[3] || path.join(DEFAULT_DIR, name);
  await download(url, dest);
}

main().catch(error => { console.error(error); process.exit(1); });
