// B"H
const { one } = require("./selectors.js");

/**
 * B"H
 * Chapter 389: The click remembered the inline vow.
 * Some virtual DOM elements expose addEventListener, some expose click, and
 * Chrome-born pages also assign `onclick`. The action now honors all three
 * without requiring client code to change.
 */
function click(window, action) {
  const el = one(window, action.selector);
  el.focus?.();
  if (typeof el.click === "function") el.click();
  else window.mouse.click(action.selector);
  if (typeof el.onclick === "function") {
    const event = new window.MouseEvent("click", { bubbles: true, cancelable: true });
    el.onclick.call(el, event);
  }
  return true;
}

module.exports = { click };
