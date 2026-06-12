// B"H
const { one } = require("./selectors.js");
function assertValue(window, action) {
  const got = String(one(window, action.selector).value ?? "");
  const expected = String(action.expected ?? action.value ?? "");
  if (got !== expected) throw new Error(`Value mismatch for ${action.selector}: ${got}`);
  return true;
}
module.exports = { assertValue };
