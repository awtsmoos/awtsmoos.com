// B"H
const { compileJsToJson } = require('./merkava-binary/MerkavaJsCompiler.js');
(async () => {
  const code = `class Vessel { field = 'field-lit'; constructor(name) { this.made = name; } method() { return 'method-lit'; } } const item = new Vessel('fire'); window.__awtsmoosResult = { made: item.made, field: item.field, proto: typeof item.method };`;
  const json = await compileJsToJson(code);
  console.log(JSON.stringify(json, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
