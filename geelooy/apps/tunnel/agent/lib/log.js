
// B"H
const fs = require("fs");
const path = require("path");

function makeLogger(root) {
  const logPath = path.join(root, "logs.txt");

  return function log(...parts) {
    const line = "[" + new Date().toISOString() + "] " + parts.join(" ");
    console.log(line);

    try {
      fs.mkdirSync(root, { recursive: true });
      fs.appendFileSync(logPath, line + "\n", "utf8");
    } catch (e) {}
  };
}

module.exports = { makeLogger };
