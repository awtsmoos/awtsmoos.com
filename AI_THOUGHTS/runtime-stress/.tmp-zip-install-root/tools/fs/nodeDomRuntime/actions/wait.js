// B"H
const { one } = require("./selectors.js");
async function waitAction(window, action) {
  if (action.selector) return one(window, action.selector);
  const ms = Number(action.ms ?? action.waitMs ?? action.timeoutMs ?? 0);
  if (ms > 0) await new Promise(resolve => setTimeout(resolve, ms));
  return true;
}
module.exports = { waitAction };
