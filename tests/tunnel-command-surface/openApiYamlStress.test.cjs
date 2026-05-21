// B"H
const assert = require("assert");
const fs = require("fs");

const files = [
  "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml",
  "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml"
];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  assert(!text.includes("- undefined"), `${file} leaked undefined action`);
  for (const token of ["- rg", "- rgbgrep", "- finishAndContinue"]) {
    assert(text.includes(`              ${token}\n`), `${file} missing ${token}`);
  }
  for (const param of ["continuationPrompt", "checkSyntax", "runtimeCheck"]) {
    assert(text.includes(`name: ${param}`), `${file} missing ${param}`);
  }
}

console.log("B'H openapi yaml stress ok");
