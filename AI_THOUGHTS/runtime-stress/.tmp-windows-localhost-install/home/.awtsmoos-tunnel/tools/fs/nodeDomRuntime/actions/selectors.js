// B"H
function one(window, selector) {
  const el = window.document.querySelector(selector);
  if (!el) throw new Error("Missing selector: " + selector);
  return el;
}
function many(window, selector) {
  return Array.from(window.document.querySelectorAll(selector) || []);
}
module.exports = { one, many };
