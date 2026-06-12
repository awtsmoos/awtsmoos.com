// B"H
const { declarationNames, idName, specLocal, specExported } = require("./names.js");

/** B"H: turns export AST nodes into local declarations plus exports bindings. */
function emitExportReplacement(source, node) {
  if (node.type === "ExportDefaultDeclaration") return defaultExport(source, node);
  if (node.declaration) return declaredExport(source, node);
  if (node.source?.value) return sourceExport(node);
  return namedExport(node);
}
function defaultExport(source, node) {
  const decl = node.declaration;
  const body = declarationText(source, decl, node.end);
  const name = idName(decl);
  if (name && /^(ClassDeclaration|FunctionDeclaration)$/.test(decl.type)) return `${body}\nexports.default = ${name};`;
  return `exports.default = ${body.replace(/^default\s+/, "")}`;
}
function declaredExport(source, node) {
  const decl = node.declaration;
  const body = declarationText(source, decl, node.end);
  const assigns = declarationNames(decl).map(name => `exports.${name} = ${name};`).join("\n");
  return `${body}\n${assigns}`;
}
function declarationText(source, decl, end) {
  let body = source.slice(decl.start, end);
  if (decl.type === "FunctionDeclaration" && decl.async && !/^async\b/.test(body.trim())) body = body.replace(/^\s*/, m => m + "async ");
  if (decl.type === "FunctionDeclaration" && decl.generator && !/^\s*(async\s+)?function\*/.test(body)) body = body.replace(/function\s+/, "function* ");
  return body;
}
function sourceExport(node) {
  const spec = node.source.value;
  if (!node.specifiers || node.specifiers.length === 0) return `Object.assign(exports, await __import(${JSON.stringify(spec)}));`;
  const tmp = `__mod_${Math.abs(Number(node.start || 0))}`;
  const lines = [`const ${tmp} = await __import(${JSON.stringify(spec)});`];
  for (const s of node.specifiers) lines.push(`exports.${specExported(s)} = ${tmp}[${JSON.stringify(specLocal(s))}];`);
  return lines.join("\n");
}
function namedExport(node) { return (node.specifiers || []).map(s => `exports.${specExported(s)} = ${specLocal(s)};`).join("\n"); }
module.exports = { emitExportReplacement, declarationText };
