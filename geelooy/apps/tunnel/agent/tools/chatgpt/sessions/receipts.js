// B"H
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { sessionReceiptsPath } = require("../storage/paths.js");

async function writeSessionReceipt(sessionId, receipt = {}) {
  const file = sessionReceiptsPath(sessionId);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const row = { receiptId: receipt.receiptId || newId(), at: new Date().toISOString(), sessionId, ...hashes(receipt), ...receipt };
  await fs.appendFile(file, JSON.stringify(row) + "\n", "utf8");
  return row;
}

function hashes(receipt = {}) { return { promptHash: sha(receipt.prompt || receipt.message || ""), responseHash: sha(receipt.text || receipt.responseText || "") }; }
function sha(value = "") { return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24); }
function newId() { return `cgpt_receipt_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`; }

module.exports = { writeSessionReceipt };
