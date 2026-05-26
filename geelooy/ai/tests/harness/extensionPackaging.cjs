//B"H
const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  return test("extension-zip-packaging-includes-service-worker-deps", async () => {
    const extRoot = path.join(ROOT, "../scripts/tricks/extensions/server");
    const prompt = fs.readFileSync(path.join(ROOT, "prompt.js"), "utf8");
    const background = fs.readFileSync(path.join(extRoot, "background.js"), "utf8");
    const listBlock = prompt.match(/EXTENSION_FILE_NAMES\s*=\s*\[([\s\S]*?)\];/)?.[1] || "";
    const listed = [...listBlock.matchAll(/"([^"]+\.(?:js|json))"/g)].map(match => match[1]);
    const imports = importScriptsDeps(background);
    const required = ["manifest.json", "background.js", "awtsmoosContent.js", "jected.js", ...imports];
    const missing = required.filter(file => !listed.includes(file));
    const absent = listed.filter(file => !fs.existsSync(path.join(extRoot, file)));
    assert(missing.length === 0, "extension zip file list is missing service-worker dependencies", { missing, listed, imports });
    assert(absent.length === 0, "extension zip file list references files that do not exist", { absent });
    assert(listed.includes("streamLedger.js") && listed.includes("bgAutomation/engine.js"), "zip must include stream ledger and background automation modules");
    return { listed: listed.length, imports: imports.length };
  });
}

function importScriptsDeps(text) {
  const deps = [];
  for (const call of text.matchAll(/importScripts\(([^)]+)\)/g)) {
    for (const item of call[1].matchAll(/"([^"]+)"/g)) deps.push(item[1]);
  }
  return deps;
}
module.exports = { run };
