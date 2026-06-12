// B"H
const { one } = require("./selectors.js");
function fill(window, action) {
  const el = one(window, action.selector);
  el.focus?.();
  el.value = String(action.value ?? action.text ?? "");
  el.dispatchEvent(new window.InputEvent("input", { bubbles: true, data: el.value }));
  el.dispatchEvent(new window.Event("change", { bubbles: true }));
  return el.value;
}
module.exports = { fill };
