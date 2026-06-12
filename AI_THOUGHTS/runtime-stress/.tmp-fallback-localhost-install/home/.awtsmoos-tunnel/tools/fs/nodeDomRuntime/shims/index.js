// B"H
const fs = require("fs");
const path = require("path");
function shimFor(spec) {
  const s = String(spec || "");
  if (s === "three" || /three\.module\.js$/.test(s) || /unpkg\.com\/three/.test(s)) return fs.readFileSync(path.join(__dirname, "three.js"), "utf8");
  return null;
}
module.exports = { shimFor };
