
// B"H
export const $ = id => document.getElementById(id);
export const qsa = s => Array.from(document.querySelectorAll(s));

export function h(tag, props = {}, kids = []) {
  const node = document.createElement(tag);
  const { className, text, html, on, attrs, data, ...rest } = props;
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  if (html !== undefined) node.innerHTML = String(html);
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null) continue;
    if (k in node) node[k] = v;
    else node.setAttribute(k, String(v));
  }
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, String(v));
  for (const [k, v] of Object.entries(data || {})) node.dataset[k] = String(v);
  for (const [k, v] of Object.entries(on || {})) node.addEventListener(k, v);
  for (const kid of kids.flat()) node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return node;
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
