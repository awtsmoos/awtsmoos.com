// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const indexJs = readFileSync("index.js", "utf8");
const requiredIds = [
  "genesisProgressBar",
  "genesisWorldBar",
  "genesisWorkerBar",
  "genesisTextureBar",
  "genesisPercentText",
  "genesisActionText",
  "genesisSubActionText",
  "genesisWorkerText",
  "genesisTextureText",
  "genesisProgressLog"
];

for (const id of requiredIds) assert(html.includes(`id="${id}"`), `first paint loader missing ${id}`);

const bridgeIndex = html.indexOf("LoadingProgressBridge.js");
const worldIndex = html.indexOf("./index.js?");
const extrasIndex = html.indexOf("bootExtras");
assert(bridgeIndex > 0, "loading progress bridge must be an explicit early module");
assert(worldIndex > bridgeIndex, "world boot must start after the tiny progress bridge");
assert(extrasIndex > worldIndex, "support modules must be deferred until after world boot starts");
assert(html.includes("__AWTSMOOS_EARLY_LOADING_QUEUE__"), "first paint loader must queue progress before modules finish");
assert(indexJs.includes("world-engine:import:start"), "index boot must publish world-engine import progress");
assert(html.includes("MITZVAH WORLD"), "loader must show a branded first-paint experience");

console.log(JSON.stringify({ ok:true, test:"loadingProgressFirstPaintAudit", ids:requiredIds.length }, null, 2));
