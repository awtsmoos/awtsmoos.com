// B"H
const { transformWithMerkavaAst } = require("./esm/astTransform.js");

/**
 * B"H
 * Parser-first ESM lowering. The old regex bridge remains only as a wounded
 * fallback when MerkavaASTParser cannot parse a wild browser scroll.
 */
async function transformModule(source = "", metaUrl = "") {
  const ast = await transformWithMerkavaAst(String(source || ""), metaUrl);
  const code = ast.ok ? ast.code : fallbackTransform(String(source || ""), metaUrl);
  return `(async function(exports, __import){\n${code}\n;return exports;})`;
}

function fallbackTransform(source, metaUrl) {
  let code = String(source || "");
  code = code.replace(/import\.meta\.url/g, JSON.stringify(metaUrl));
  code = code.replace(/import\.meta/g, `({url:${JSON.stringify(metaUrl)}})`);
  code = code.replace(/\s+(assert|with)\s*\{[^}]*\}/g, "");
  code = code.replace(/import\s+\*\s+as\s+([\w$]+)\s+from\s+["']([^"']+)["'];?/g, "const $1 = await __import('$2');");
  code = code.replace(/import\s+([\w$]+)\s+from\s+["']([^"']+)["'];?/g, "const $1 = (await __import('$2')).default;");
  code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g, (_, n, s) => `const {${n.replace(/\s+as\s+/g, ": ")}} = await __import('${s}');`);
  code = code.replace(/import\s+["']([^"']+)["'];?/g, "await __import('$1');");
  code = code.replace(/export\s+default\s+/g, "exports.default = ");
  code = code.replace(/export\s+class\s+([\w$]+)/g, "exports.$1 = class $1");
  code = code.replace(/export\s+(const|let|var)\s+([\w$]+)\s*=/g, "$1 $2 = exports.$2 =");
  code = code.replace(/export\s+\*\s+from\s+["']([^"']+)["'];?/g, "Object.assign(exports, await __import('$1'));");
  return code;
}
module.exports = { transformModule, fallbackTransform };
