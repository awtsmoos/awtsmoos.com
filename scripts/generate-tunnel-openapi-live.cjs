// B"H
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const actionsPath = path.join(repoRoot, "geelooy/api/tunnel/control/docs/actions.js");
const yamlPath = path.join(repoRoot, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml");
const livePath = path.join(repoRoot, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml");

const { actions } = require(actionsPath);
const source = fs.readFileSync(yamlPath, "utf8");
const sorted = [...new Set(actions)].sort((a, b) => a.localeCompare(b));
const enumBlock = ["            enum:", ...sorted.map(action => `              - ${action}`)].join("\n");
const next = source.replace(
  /            enum:\r?\n(?:              - .+\r?\n)+(?=        - \{ name: p,)/,
  enumBlock + "\n"
);

if (next === source && !source.includes(sorted[0])) {
  throw new Error("Could not find OpenAPI action enum block.");
}

fs.writeFileSync(yamlPath, next, "utf8");
fs.writeFileSync(livePath, next, "utf8");
console.log(JSON.stringify({ ok: true, actions: sorted.length, yamlPath, livePath }, null, 2));
