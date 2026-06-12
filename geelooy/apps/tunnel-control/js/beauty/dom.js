// B"H

/**
 * B"H
 * Chapter 389: Beauty Received A Small Hammer Of DOM.
 */
export function el(tag, { classes = [], attrs = {}, text = "", children = [] } = {}) {
  const node = document.createElement(tag);
  for (const cls of classes) if (cls) node.classList.add(cls);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== false && value !== null && value !== undefined) node.setAttribute(key, String(value));
  }
  if (text !== "") node.textContent = String(text);
  node.append(...children);
  return node;
}

export function button(label, classes = []) {
  return el("button", { attrs: { type: "button" }, classes, text: label });
}

export function text(tag, value, classes = []) {
  return el(tag, { classes, text: value });
}
