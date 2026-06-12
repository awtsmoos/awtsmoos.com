// B"H
const vm = require("vm");
function evaluate(context, action) {
  if (typeof action.function === "function") return action.function(context.window, context.document);
  const source = action.source || action.expression || action.script || "undefined";
  return vm.runInContext(String(source), context, { filename: "node-dom-action-evaluate.js" });
}
module.exports = { evaluate };
