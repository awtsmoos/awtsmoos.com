// B"H
const { compileJsToJson } = require('./merkava-binary/MerkavaJsCompiler.js');
(async () => {
  const snippets = {
    missing: 'window.__awtsmoosResult = missingName + 1;',
    local: 'function f(){ const secret = 9; return secret; } f(); window.__awtsmoosResult = secret;',
    type: 'const obj = {}; window.__awtsmoosResult = obj.missing.go();',
    block: '{ const y = 3; } window.__awtsmoosResult = y;'
  };
  const out = {};
  for (const [name, source] of Object.entries(snippets)) {
    try { out[name] = await compileJsToJson(source); }
    catch (error) { out[name] = { error: error.message, stack: error.stack }; }
  }
  console.log(JSON.stringify(out, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
