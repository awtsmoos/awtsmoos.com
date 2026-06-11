/**
 * B"H
 * Forges DOM from data.
 *
 * The Awtsmoos speaks a tree of plain objects into actual elements. When a
 * child is already a live Node, this forge honors it instead of reshaping it;
 * thus data and prebuilt fragments can walk together without collision.
 *
 * @param {object|string|Node} node - Declarative node, live node, or text.
 * @returns {Node} A live DOM node.
 */
export function forge(node) {
  if (node instanceof Node) return node;
  if (typeof node === 'string') return document.createTextNode(node);
  const el = document.createElement(node.tag || 'div');
  for (const [key, value] of Object.entries(node.attrs || {})) {
    if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else el.setAttribute(key, value);
  }
  for (const [event, handler] of Object.entries(node.on || {})) {
    el.addEventListener(event, handler);
  }
  for (const child of node.children || []) el.appendChild(forge(child));
  return el;
}

/**
 * B"H
 * Replaces all children with one revealed structure.
 *
 * @param {Element} host - Container receiving the new palace.
 * @param {object|string|Node} node - Declarative DOM tree or live node.
 * @returns {Node} The appended node.
 */
export function reveal(host, node) {
  host.replaceChildren();
  const made = forge(node);
  host.appendChild(made);
  return made;
}
