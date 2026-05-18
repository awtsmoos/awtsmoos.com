// B"H
const { walk } = require("./walk.js");
const { parseWithMerkava } = require("./merkavaParser.js");

function loc(node) {
  return { start: node.start ?? null, end: node.end ?? null, loc: node.loc || null };
}

function nameOf(node) {
  if (!node) return null;
  if (node.name) return node.name;
  if (node.id && node.id.name) return node.id.name;
  if (node.key && node.key.name) return node.key.name;
  if (node.key && node.key.value) return String(node.key.value);
  return null;
}

function importSpec(node) {
  return node.source && node.source.value ? node.source.value : null;
}

function exportName(node) {
  if (node.declaration) return nameOf(node.declaration) || node.declaration.type;
  return node.source && node.source.value ? node.source.value : "anonymous";
}

/**
 * B"H
 * Extracts a compact semantic outline from a Merkava AST.
 *
 * @param {object} ast Program AST.
 * @returns {object} AI-sized outline.
 */
function outlineFromAst(ast) {
  const outline = { imports: [], exports: [], functions: [], classes: [], variables: [] };

  walk(ast, (node, parent) => {
    if (node.type === "ImportDeclaration") {
      outline.imports.push({ spec: importSpec(node), ...loc(node) });
    }

    if (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration") {
      outline.exports.push({ kind: node.type, name: exportName(node), ...loc(node) });
    }

    if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression") {
      outline.functions.push({ name: nameOf(node), kind: node.type, ...loc(node) });
    }

    if (node.type === "ArrowFunctionExpression" && parent && parent.id) {
      outline.functions.push({ name: nameOf(parent), kind: node.type, ...loc(parent) });
    }

    if (node.type === "ClassDeclaration" || node.type === "ClassExpression") {
      outline.classes.push({ name: nameOf(node), kind: node.type, ...loc(node) });
    }

    if (node.type === "VariableDeclarator") {
      outline.variables.push({ name: nameOf(node.id), kind: node.init && node.init.type, ...loc(node) });
    }
  });

  return outline;
}

/**
 * B"H
 * Parses source through Merkava and returns semantic outline data.
 *
 * @param {string} text Source text.
 * @returns {Promise<object>} Outline result.
 */
async function astOutlineFromText(text) {
  const parsed = await parseWithMerkava(text);
  if (!parsed.ok) return { ok: false, error: parsed.error, errors: parsed.errors };
  return { ok: true, parser: "MerkavaASTParser", errors: parsed.errors, ...outlineFromAst(parsed.ast) };
}

module.exports = { astOutlineFromText, outlineFromAst };
