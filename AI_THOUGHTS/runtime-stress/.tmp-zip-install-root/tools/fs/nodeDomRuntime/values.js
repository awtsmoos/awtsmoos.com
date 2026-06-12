// B"H
const vm = require("vm");

function readValues(context, expressions = []) {
  const out = {};
  for (const expr of Array.isArray(expressions) ? expressions : []) {
    try { out[String(expr)] = vm.runInContext(String(expr), context, { filename: "node-dom-return-value.js" }); }
    catch (error) { out[String(expr)] = { error: error.message }; }
  }
  return out;
}

module.exports = { readValues };
