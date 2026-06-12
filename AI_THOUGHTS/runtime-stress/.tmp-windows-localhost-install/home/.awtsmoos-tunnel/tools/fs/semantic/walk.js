// B"H

/**
 * B"H
 * Walks an AST as a quiet footstep through a palace of sparks.
 *
 * @param {object} node AST node.
 * @param {(node:object,parent:object|null)=>void} visit Visitor.
 * @param {object|null} parent Parent node.
 * @returns {void}
 */
function walk(node, visit, parent = null) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node, parent);

  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "range" || key === "start" || key === "end") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit, node);
    } else if (value && typeof value === "object") {
      walk(value, visit, node);
    }
  }
}

module.exports = { walk };
