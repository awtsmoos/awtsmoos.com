// B"H
const { compileJsToJson } = require('./merkava-binary/MerkavaJsCompiler.js');
(async () => {
  const code = `class A { html(opts = {}) { if (!opts || typeof opts != 'object') return null; return opts.tag || 'ok'; } } const a = new A(); window.__awtsmoosResult = a.html({tag:'div'});`;
  const json = await compileJsToJson(code);
  console.log(JSON.stringify(json, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
