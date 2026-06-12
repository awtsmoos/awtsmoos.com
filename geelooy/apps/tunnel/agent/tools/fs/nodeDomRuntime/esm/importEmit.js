// B"H
const { specLocal, specImported } = require("./names.js");

/** B"H: turns ImportDeclaration AST nodes into awaited CommonJS-like bindings. */
function emitImport(node) {
  const spec = node.source?.value;
  const tmp = `__mod_${Math.abs(Number(node.start || 0))}`;
  const lines = [`const ${tmp} = await __import(${JSON.stringify(spec)});`];
  for (const s of node.specifiers || []) {
    const local = specLocal(s);
    if (!local) continue;
    if (s.type === "ImportDefaultSpecifier") lines.push(`const ${local} = ${tmp}.default;`);
    else if (s.type === "ImportNamespaceSpecifier") lines.push(`const ${local} = ${tmp};`);
    else lines.push(`const ${local} = ${tmp}[${JSON.stringify(specImported(s))}];`);
  }
  return lines.join("\n");
}
module.exports = { emitImport };
