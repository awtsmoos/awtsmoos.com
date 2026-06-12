// B"H
const { one } = require("./selectors.js");
function click(window, action) {
  const el = one(window, action.selector);
  el.focus?.();
  if (typeof el.click === "function") return el.click();
  return window.mouse.click(action.selector);
}
module.exports = { click };
