// B"H
const { compileJsToJson } = require('./merkava-binary/MerkavaJsCompiler.js');
(async () => {
  const code = `window.__r = window.obj?.missing?.() || "fallback";`;
  const json = await compileJsToJson(code);
  console.log(JSON.stringify(json, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
