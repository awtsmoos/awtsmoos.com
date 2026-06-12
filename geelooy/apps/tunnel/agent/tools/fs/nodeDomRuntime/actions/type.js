// B"H
const { one } = require("./selectors.js");
function typeText(window, action) {
  const el = one(window, action.selector);
  el.focus?.();
  window.keyboard.type(String(action.text ?? action.value ?? ""));
  return el.value;
}
module.exports = { typeText };
