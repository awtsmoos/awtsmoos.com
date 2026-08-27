// B"H

export const $ = id => document.getElementById(id);
export const qsa = s => Array.from(document.querySelectorAll(s));

/**
 * B"H
 * Chapter 412: Children Stopped Fighting The Getter.
 *
 * The Awtsmoos breathes each DOM child into place by append, not by assigning to
 * the read-only children collection. Thus live traffic cards can be born
 * without breaking the page every polling breath.
 */
export function h(tag, props = {}, kids = []) {
  const node = document.createElement(tag);
  const { className, text, html, on, attrs, data, children, ...rest } = props;
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  if (html !== undefined) node.innerHTML = String(html);
  setProps(node, rest);
  setAttrs(node, attrs);
  setData(node, data);
  setEvents(node, on);
  appendKids(node, children || kids);
  return node;
}

function setProps(node, props) {
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null) continue;
    if (key in node) node[key] = value;
    else node.setAttribute(key, String(value));
  }
}

function setAttrs(node, attrs = {}) {
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
}

function setData(node, data = {}) {
  for (const [key, value] of Object.entries(data)) node.dataset[key] = String(value);
}

function setEvents(node, on = {}) {
  for (const [key, value] of Object.entries(on)) node.addEventListener(key, value);
}

function appendKids(node, kids = []) {
  for (const kid of [kids].flat(3)) {
    if (kid === undefined || kid === null) continue;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
}

export function field(id, label, attrs = {}) {
  return h("label", {}, [label, h("input", { id, ...attrs })]);
}

export function area(id, label, text = "") {
  return h("label", {}, [label, h("textarea", { id, value: text })]);
}

export function out(id, text = "Ready.") {
  return h("pre", { id, text });
}
