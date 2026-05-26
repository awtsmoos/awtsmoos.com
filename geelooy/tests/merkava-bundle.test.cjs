// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const MerkavaExecutor = require("../scripts/awtsmoos/MerkavaExecutor/merkavaexecutor.cjs");

(async () => {
  const bundle = await MerkavaExecutor.bundleEntry({
    entry: "/index.html",
    files: {
      "/index.html": '<link rel="stylesheet" href="./style.css"><main id="app"></main><script type="module" src="./main.js"></script>',
      "/style.css": '@import "./theme.css"; #app { color: red; }',
      "/theme.css": "#app { background: black; }",
      "/main.js": 'import { label } from "./dep.js"; const value = label; app.textContent = value;',
      "/dep.js": 'export const label = "linked";'
    }
  });
  assert.equal(bundle.ok, true);
  assert.equal(bundle.fileCount, 5);
  assert.equal(Buffer.from(bundle.binary).slice(0, 4).toString("binary"), "MD2\0");

  const self = await MerkavaExecutor.bundleSelf();
  assert.equal(self.ok, true);
  assert.ok(self.fileCount >= 1);
  assert.equal(Buffer.from(self.binary).slice(0, 4).toString("binary"), "MD2\0");

  const out = path.join(__dirname, "../apps/merkava-native-browser/dist/merkavaexecutor-self.md2");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(self.binary));
  console.log(JSON.stringify({ ok: true, linkedFiles: bundle.fileCount, selfFiles: self.fileCount }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
