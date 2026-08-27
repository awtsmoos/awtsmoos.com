
// B"H

/**
 * B"H
 * Toggles a class by truth.
 *
 * @param {Element|null} node Target node.
 * @param {string} cls Class name.
 * @param {boolean} yes Whether to add.
 * @returns {void}
 */
export function setClass(node, cls, yes) {
  if (!node) return;
  node.classList.toggle(cls, !!yes);
}

/**
 * B"H
 * Removes classes from a group.
 *
 * @param {Element[]} nodes Nodes.
 * @param {string} cls Class name.
 * @returns {void}
 */
export function removeClassFromAll(nodes, cls) {
  for (const node of nodes) node.classList.remove(cls);
}

/**
 * B"H
 * Adds a class to one node while removing it from siblings.
 *
 * @param {Element[]} nodes Nodes.
 * @param {Element} active Active node.
 * @param {string} cls Class name.
 * @returns {void}
 */
export function onlyClass(nodes, active, cls) {
  removeClassFromAll(nodes, cls);
  active.classList.add(cls);
}
