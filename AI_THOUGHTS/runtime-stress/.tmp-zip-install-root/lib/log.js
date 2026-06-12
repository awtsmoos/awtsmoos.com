
// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

function fallbackRoot() {
  return path.join(os.homedir(), ".awtsmoos-tunnel");
}

function makeLogger(root) {
  const safeRoot = typeof root === "string" && root.trim() ? root : fallbackRoot();
  const logPath = path.join(safeRoot, "logs.txt");

  return function log(...parts) {
    const line = "[" + new Date().toISOString() + "] " + parts.join(" ");
    console.log(line);

    try {
      fs.mkdirSync(safeRoot, { recursive: true });
      fs.appendFileSync(logPath, line + "\n", "utf8");
    } catch (e) {
      console.log("[Awtsmoos log fallback failed]", e.message);
    }
  };
}

module.exports = { makeLogger };
