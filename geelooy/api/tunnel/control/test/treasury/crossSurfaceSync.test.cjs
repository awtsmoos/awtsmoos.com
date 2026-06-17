// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../../../..");
const FILES = {
  osStart: "geelooy/os/startMenu.js",
  codePalette: "geelooy/apps/code/js/command-palette/commands.js",
  codeExecutor: "geelooy/apps/code/js/command-palette/executor.js",
  accountPanel: "geelooy/apps/code/js/session/account-panel.js"
};
const CRITICAL = [
  "/api/tunnel/control/treasury/home",
  "/api/tunnel/control/treasury/budgets",
  "/api/tunnel/control/treasury/marketplace",
  "/api/tunnel/control/treasury/graph",
  "/api/tunnel/control/bank",
  "/apps/tunnel-control/",
  "/apps/code/",
  "/os"
];

/** B"H: OS and Apps/Code must not drift away from the Treasury OS doors. */
function run() {
  const text = Object.fromEntries(Object.entries(FILES).map(([key, file]) => [key, fs.readFileSync(path.join(ROOT, file), "utf8")]));
  assertContains(text.osStart, ["TREASURY_LINKS", ...CRITICAL.filter(x => x !== "/os")], "OS start menu");
  assertContains(text.codePalette, ["open-url:/api/tunnel/control/treasury/home", "/api/tunnel/control/treasury/forecast", "/api/tunnel/control/treasury/advisor", "/api/tunnel/control/treasury/reputation", "/apps/tunnel-control/", "/os"], "Code command palette");
  assertContains(text.codeExecutor, ["open-url:", "Blocked unsafe portal URL", "noopener,noreferrer"], "Code palette executor");
  assertContains(text.accountPanel, ["PORTALS", "/api/tunnel/control/treasury/home", "/api/tunnel/control/treasury/budgets", "/api/tunnel/control/bank", "/apps/tunnel-control/", "/os"], "Code account panel");
  return { ok: true, surfaces: Object.keys(FILES), criticalUrls: CRITICAL.length };
}
function assertContains(text, needles, label) {
  for (const needle of needles) assert(text.includes(needle), `${label} missing ${needle}`);
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
