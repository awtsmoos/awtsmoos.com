
// B"H

/**
 * B"H
 * Tiny HTML generator.
 *
 * The page becomes calmer when elements are made from clear vessels instead
 * of scattered imperative DOM calls.
 *
 * @param {string} tag HTML tag.
 * @param {object} options Element options.
 * @returns {HTMLElement} Created element.
 */
export function h(tag, options = {}) {
  const node = document.createElement(tag);

  for (const cls of options.classes || []) {
    const token = String(cls || "").trim();
    if (token) node.classList.add(token);
  }

  for (const [key, value] of Object.entries(options.attrs || {})) {
    if (value !== false && value !== null && value !== undefined) {
      node.setAttribute(key, String(value));
    }
  }

  if (options.text !== undefined) node.textContent = String(options.text);

  for (const child of options.children || []) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

/**
 * B"H
 * Selects one node.
 *
 * @param {string} selector CSS selector.
 * @param {ParentNode} [root] Search root.
 * @returns {Element|null} Found node.
 */
export function one(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * B"H
 * Selects many nodes.
 *
 * @param {string} selector CSS selector.
 * @param {ParentNode} [root] Search root.
 * @returns {Element[]} Found nodes.
 */
export function many(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}
