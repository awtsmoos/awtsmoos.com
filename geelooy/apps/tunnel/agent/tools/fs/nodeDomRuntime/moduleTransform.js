// B"H
const { transformWithMerkavaAst } = require("./esm/astTransform.js");

/**
 * B"H
 * Chapter 425: Dynamic Import Became A Door In The Same Room.
 *
 * Parser-first remains the crown, but raw import/export and import() sparks are
 * lowered before Node's VM can reject them. Every module child is loaded through
 * the same __import vessel, so DOM mutations stay in one living window.
 */
async function transformModule(source = "", metaUrl = "") {
  const raw = String(source || "");
  const ast = await transformWithMerkavaAst(raw, metaUrl);
  const base = ast.ok && !(ast.errors || []).length && !hasModuleSyntax(ast.code)
    ? ast.code
    : fallbackTransform(raw, metaUrl);
  const code = lowerDynamicImports(base);
  return `(async function(exports, __import){\n${code}\n;return exports;})`;
}

function fallbackTransform(source, metaUrl) {
  let code = String(source || "");
  code = patchImportMeta(code, metaUrl);
  code = stripImportAttributes(code);
  code = lowerStaticImports(code);
  code = lowerExports(code);
  return lowerDynamicImports(code);
}

function patchImportMeta(code, metaUrl) {
  return String(code || "")
    .replace(/import\.meta\.url/g, JSON.stringify(metaUrl))
    .replace(/import\.meta/g, `({url:${JSON.stringify(metaUrl)}})`);
}

function stripImportAttributes(code) {
  return String(code || "").replace(/\s+(assert|with)\s*\{[^}]*\}/g, "");
}

function lowerStaticImports(code) {
  return String(code || "")
    .replace(/import\s+\*\s+as\s+([\w$]+)\s+from\s+["']([^"']+)["'];?/g, "const $1 = await __import('$2');")
    .replace(/import\s+([\w$]+)\s+from\s+["']([^"']+)["'];?/g, "const $1 = (await __import('$2')).default;")
    .replace(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g, (_, names, spec) => `const {${names.replace(/\s+as\s+/g, ": ")}} = await __import('${spec}');`)
    .replace(/import\s+["']([^"']+)["'];?/g, "await __import('$1');");
}

function lowerDynamicImports(code) {
  return String(code || "").replace(/\bimport\s*\(\s*(["'][^"']+["'])\s*\)/g, "__import($1)");
}

function lowerExports(code) {
  let out = String(code || "");
  out = out.replace(/export\s+default\s+(async\s+function\s+([\w$]+)\s*\()/g, "async function $2(");
  out = out.replace(/export\s+default\s+(function\s+([\w$]+)\s*\()/g, "function $2(");
  out = out.replace(/export\s+default\s+(class\s+([\w$]+)\b)/g, "class $2");
  out = out.replace(/export\s+default\s+/g, "exports.default = ");
  out = out.replace(/export\s+(async\s+function\s+([\w$]+)\s*\()/g, "async function $2(");
  out = out.replace(/export\s+(function\s+([\w$]+)\s*\()/g, "function $2(");
  out = out.replace(/export\s+(class\s+([\w$]+)\b)/g, "class $2");
  out = out.replace(/export\s+(const|let|var)\s+([\w$]+)\s*=/g, "$1 $2 = exports.$2 =");
  out = out.replace(/export\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g, (_, names, spec) => reexportNamed(names, spec));
  out = out.replace(/export\s+\*\s+from\s+["']([^"']+)["'];?/g, "Object.assign(exports, await __import('$1'));");
  out = out.replace(/export\s+\{([^}]+)\};?/g, (_, names) => namedExports(names));
  out += exportAssignments(code);
  return out;
}

function namedExports(names) {
  return names.split(",").map(part => {
    const [local, exported] = part.trim().split(/\s+as\s+/);
    const name = (exported || local || "").trim();
    const value = (local || "").trim();
    return name && value ? `exports.${name} = ${value};` : "";
  }).filter(Boolean).join("\n");
}

function reexportNamed(names, spec) {
  const tmp = `__reexport_${Math.random().toString(36).slice(2)}`;
  return `const ${tmp} = await __import('${spec}');\n` + names.split(",").map(part => {
    const [local, exported] = part.trim().split(/\s+as\s+/);
    const name = (exported || local || "").trim();
    const value = (local || "").trim();
    return name && value ? `exports.${name} = ${tmp}[${JSON.stringify(value)}];` : "";
  }).filter(Boolean).join("\n");
}

function exportAssignments(original) {
  const assigns = [];
  for (const match of String(original || "").matchAll(/export\s+(?:async\s+)?function\s+([\w$]+)\s*\(/g)) assigns.push(`\nexports.${match[1]} = ${match[1]};`);
  for (const match of String(original || "").matchAll(/export\s+class\s+([\w$]+)\b/g)) assigns.push(`\nexports.${match[1]} = ${match[1]};`);
  return assigns.join("");
}

function hasModuleSyntax(code) {
  return /(^|\n)\s*(import|export)\s/m.test(String(code || ""));
}

module.exports = { transformModule, fallbackTransform, hasModuleSyntax, lowerDynamicImports };
