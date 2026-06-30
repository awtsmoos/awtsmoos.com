// B"H
/**
 * @module EditorDom
 * @description
 * Tiny DOM vessels for the editor, so forms can be built plainly without a
 * framework pretending the page is larger than it is.
 */

/**
 * Creates an element with attributes, listeners, and children.
 * @param {string} tag tag name
 * @param {object} options element options
 * @param {(Node|string)[]} children child nodes or text
 * @returns {HTMLElement}
 */
export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  Object.entries(options.attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
  Object.entries(options.on || {}).forEach(([key, value]) => node.addEventListener(key, value));
  children.forEach(child => node.append(child));
  return node;
}
