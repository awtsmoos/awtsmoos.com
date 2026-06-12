// B"H
/** B"H: names rise from AST vessels without inventing them. */
function idName(node) { return node?.name || node?.id?.name || null; }
function declarationNames(node) {
  if (!node) return [];
  if (node.type === "VariableDeclaration") return (node.declarations || []).map(d => idName(d.id)).filter(Boolean);
  const name = idName(node);
  return name ? [name] : [];
}
function specLocal(spec) { return spec?.local?.name || spec?.local?.value || null; }
function specExported(spec) { return spec?.exported?.name || spec?.exported?.value || specLocal(spec); }
function specImported(spec) { return spec?.imported?.name || spec?.imported?.value || specLocal(spec); }
module.exports = { idName, declarationNames, specLocal, specExported, specImported };
