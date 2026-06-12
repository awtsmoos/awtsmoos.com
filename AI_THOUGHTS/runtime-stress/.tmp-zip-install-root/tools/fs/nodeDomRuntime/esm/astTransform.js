// B"H
const { parseWithMerkava } = require("../../semantic/merkavaParser.js");
const { applyPatches, patch } = require("./sourcePatch.js");
const { emitImport } = require("./importEmit.js");
const { emitExportReplacement } = require("./exportEmit.js");

/**
 * B"H
 * Uses MerkavaASTParser as the first authority for ESM lowering. If it cannot
 * parse, the caller may fall back, but a parser success means spans rule.
 */
async function transformWithMerkavaAst(source, metaUrl = "") {
  const parsed = await parseWithMerkava(source);
  if (!parsed.ok || !parsed.ast?.body) return { ok: false, error: parsed.error, errors: parsed.errors || [] };
  const patches = [];
  for (const node of parsed.ast.body) {
    if (node.type === "ImportDeclaration") patches.push(patch(node.start, node.end, emitImport(node)));
    if (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration") patches.push(patch(node.start, node.end, emitExportReplacement(source, node)));
  }
  let code = applyPatches(source, patches);
  code = code.replace(/import\.meta\.url/g, JSON.stringify(metaUrl));
  code = code.replace(/import\.meta/g, `({url:${JSON.stringify(metaUrl)}})`);
  return { ok: true, code, errors: parsed.errors || [] };
}
module.exports = { transformWithMerkavaAst };
