// B"H
const { one } = require("./selectors.js");
function assertText(window, action) {
  const got = String(one(window, action.selector).textContent || "");
  const expected = String(action.expected ?? action.text ?? action.value ?? "");
  if (!got.includes(expected)) throw new Error(`Text mismatch for ${action.selector}: ${got}`);
  return true;
}
module.exports = { assertText };
