// B"H

const path = require("path");
const { parseJavaScript } = require("./ast.js");
const { collectTopLevelExports, collectTopLevelModuleLinks } = require("./imports.js");
const { isLocalImport, resolveLocalImport } = require("./paths.js");

/**
 * B"H
 * Compact compiler: local static imports are folded into one module scroll,
 * while each folded chamber still remembers its own original browser URL. The
 * Awtsmoos does not special-case one broken path; it restores the rules of ESM
 * so `import.meta.url`, dynamic `import('./x.js')`, CSS template exports,
 * re-exports, and circular import references keep acting like separate files.
 */
async function compileCompactModule({ fs, entryFile, rootDir }) {
  const state = createState(fs, entryFile, rootDir);
  await addFileToCompactModule(state, state.entryFile);
  return renderCompactModule(state);
}

function createState(fs, entryFile, rootDir) {
  return {
    fs,
    entryFile: path.resolve(entryFile),
    rootDir: path.resolve(rootDir),
    modules: [],
    modulesByFile: new Map(),
    externals: new Map()
  };
}

async function addFileToCompactModule(state, filePath) {
  const absolute = path.resolve(filePath);
  if (state.modulesByFile.has(absolute)) return state.modulesByFile.get(absolute);

  const source = await state.fs.readFile(absolute, "utf-8");
  const ast = await parseJavaScript(source);
  const record = {
    id: `__awtsmoosModule_${state.modules.length}`,
    filePath: absolute,
    source,
    ast,
    links: collectTopLevelModuleLinks(ast),
    exportInfo: collectTopLevelExports(ast),
    deps: new Map(),
    dynamicDeps: new Map(),
    externalDeps: new Map(),
    orderIndex: -1
  };

  state.modulesByFile.set(absolute, record);
  state.modules.push(record);

  for (const link of record.links) {
    if (isLocalImport(link.source)) {
      const resolved = resolveLocalImport({ fromFile: absolute, source: link.source, rootDir: state.rootDir });
      if (resolved) record.deps.set(link.source, await addFileToCompactModule(state, resolved));
    } else if (link.type === "ImportDeclaration") {
      record.externalDeps.set(link.source, externalRecordFor(state, link.source));
    }
  }

  for (const spec of collectLiteralDynamicImports(source)) {
    const clean = stripSpecifierDecorations(spec);
    if (!isLocalImport(clean)) continue;
    const resolved = resolveLocalImport({ fromFile: absolute, source: clean, rootDir: state.rootDir });
    if (resolved) record.dynamicDeps.set(spec, await addFileToCompactModule(state, resolved));
  }

  return record;
}

/**
 * B"H
 * Collects literal local dynamic imports so the compact universe can include
 * those future chambers before runtime. The browser still sees a Promise from
 * import(), but the resolved namespace is the same singleton vessel already
 * folded into this response.
 * @param {string} source Raw module source.
 * @returns {string[]} Literal dynamic import specifiers.
 */
function collectLiteralDynamicImports(source) {
  const found = new Set();
  const pattern = /\bimport\s*\(\s*(["\'])(\.\.?\/[^"\']+)\1\s*\)/g;
  for (const match of String(source || "").matchAll(pattern)) found.add(match[2]);
  return [...found];
}

function externalRecordFor(state, source) {
  if (state.externals.has(source)) return state.externals.get(source);
  const record = { source, id: `__awtsmoosExternal_${state.externals.size}` };
  state.externals.set(source, record);
  return record;
}

function renderCompactModule(state) {
  const entry = state.modulesByFile.get(state.entryFile);
  const ordered = dependencyFirstOrder(entry);
  ordered.forEach((record, index) => { record.orderIndex = index; });

  return [
    ...[...state.externals.values()].map((item) => `import * as ${item.id} from ${JSON.stringify(item.source)};`),
    liveImportHelpers(),
    ...ordered.map((record) => `var ${record.id};`),
    ...ordered.map((record) => renderScopedModule(state, record)),
    renderEntryExports(entry)
  ].filter(Boolean).join("\n");
}

function liveImportHelpers() {
  return `/* B\\"H compact live import helpers */
function __awtsmoosLiveImport(getModule, name) {
  const read = () => {
    const module = getModule();
    return module && module[name];
  };
  return new Proxy(function __awtsmoosLiveBinding(...args) {
    const value = read();
    if (typeof value !== "function") return value;
    return value(...args);
  }, {
    apply(_target, thisArg, args) {
      const value = read();
      if (typeof value !== "function") throw new TypeError(String(name) + " is not a function");
      return Reflect.apply(value, thisArg, args);
    },
    construct(_target, args) {
      const value = read();
      if (typeof value !== "function") throw new TypeError(String(name) + " is not a constructor");
      return Reflect.construct(value, args);
    },
    get(_target, prop) {
      if (prop === Symbol.toPrimitive) return () => read();
      if (prop === "valueOf") return () => read();
      if (prop === "toString") return () => String(read());
      const value = read();
      return value == null ? undefined : value[prop];
    },
    set(_target, prop, newValue) {
      const targetValue = read();
      if (targetValue == null) return false;
      targetValue[prop] = newValue;
      return true;
    }
  });
}
function __awtsmoosLiveNamespace(getModule) {
  return new Proxy({}, { get(_target, prop) {
    const module = getModule();
    return module == null ? undefined : module[prop];
  }});
}`;
}

function dependencyFirstOrder(entry) {
  const seen = new Set();
  const ordered = [];
  function visit(record) {
    if (!record || seen.has(record.filePath)) return;
    seen.add(record.filePath);
    for (const child of record.deps.values()) visit(child);
    for (const child of (record.dynamicDeps || new Map()).values()) visit(child);
    for (const child of (record.dynamicDeps || new Map()).values()) visit(child);
    ordered.push(record);
  }
  visit(entry);
  return ordered;
}

function renderScopedModule(state, record) {
  const relative = slash(path.relative(state.rootDir, record.filePath));
  return [
    `/* B\\"H compact source: ${relative} */`,
    `${record.id} = (() => {`,
    `const __exports = {};`,
    transformModuleBody(state, record).trim(),
    `return Object.freeze(__exports);`,
    `})();`
  ].join("\n");
}

function transformModuleBody(state, record) {
  const replacements = [];
  for (const node of record.ast.body || []) {
    if (node.type === "ImportDeclaration") {
      replacements.push([node.start, node.end, importReplacement(record, node)]);
    } else if (node.type === "ExportNamedDeclaration") {
      replacements.push([node.start, exportNamedReplacementEnd(record, node), namedExportReplacement(record, node)]);
    } else if (node.type === "ExportDefaultDeclaration") {
      replacements.push([node.start, exportDefaultReplacementEnd(record, node), defaultExportReplacement(record, node)]);
    } else if (node.type === "ExportAllDeclaration") {
      replacements.push([node.start, node.end, exportAllReplacement(record, node)]);
    }
  }

  const replaced = applyReplacements(record.source, replacements);
  const urlFixed = rewriteModuleRelativeUrls(state, record, replaced);
  return replaceRemainingExportLists(replaceRemainingExportDeclarations(replaceRemainingDefaultExports(urlFixed)));
}

function rewriteModuleRelativeUrls(state, record, source) {
  const originalUrl = originalBrowserUrl(state, record);
  return rewriteDynamicImports(state, record, rewriteImportMetaUrl(source, originalUrl), originalUrl);
}

function originalBrowserUrl(state, record) {
  return `/${slash(path.relative(state.rootDir, record.filePath))}`;
}

function rewriteImportMetaUrl(source, originalUrl) {
  const replacement = `new URL(${JSON.stringify(originalUrl)}, globalThis.location?.origin || import.meta.url).href`;
  return String(source || "").replace(/\bimport\s*\.\s*meta\s*\.\s*url\b/g, replacement);
}

function rewriteDynamicImports(state, record, source, originalUrl) {
  return String(source || "").replace(/\bimport\s*\(\s*(["'])(\.\.?\/[^"']+)\1\s*\)/g, (_m, _q, spec) => {
    const bundled = resolveBundledDynamicImport(state, record, spec);
    if (bundled) return `Promise.resolve(${bundled.id})`;
    return `import(new URL(${JSON.stringify(spec)}, new URL(${JSON.stringify(originalUrl)}, globalThis.location?.origin || import.meta.url).href).href)`;
  });
}

/**
 * B"H
 * Maps a local dynamic import back into the current compact universe when the
 * target file is already present in the folded graph. This prevents a second
 * State/App/DOM singleton from being born merely because a dynamic import was
 * encountered inside compacted code.
 *
 * @param {object} state Compiler state.
 * @param {object} record Current module record.
 * @param {string} spec Dynamic import specifier.
 * @returns {object|null} Bundled module record when present.
 */
function resolveBundledDynamicImport(state, record, spec) {
  const clean = stripSpecifierDecorations(spec);
  if (!isLocalImport(clean)) return null;
  const resolved = resolveLocalImport({ fromFile: record.filePath, source: clean, rootDir: state.rootDir });
  return resolved ? state.modulesByFile.get(path.resolve(resolved)) || null : null;
}

function stripSpecifierDecorations(spec) {
  return String(spec || "").split("#")[0].split("?")[0];
}

function importReplacement(record, node) {
  const source = node.source && node.source.value;
  const dep = record.deps.get(source);
  const external = record.externalDeps.get(source);
  const sourceObject = (dep || external || {}).id;
  if (!sourceObject) return record.source.slice(node.start, node.end);

  const mustBeLive = dep && dep.orderIndex > record.orderIndex;
  return (node.specifiers || []).map((specifier) => importSpecifierReplacement(record, specifier, sourceObject, mustBeLive)).filter(Boolean).join("\n");
}

function importSpecifierReplacement(record, specifier, sourceObject, mustBeLive) {
  const local = specifier.local && specifier.local.name;
  if (!local) return "";
  if (specifier.type === "ImportSpecifier") {
    const imported = specifier.imported && specifier.imported.name;
    if (!mustBeLive || isSuperclassImport(record.source, local)) return `var ${local} = ${sourceObject}.${imported};`;
    return `var ${local} = __awtsmoosLiveImport(() => ${sourceObject}, ${JSON.stringify(imported)});`;
  }
  if (specifier.type === "ImportDefaultSpecifier") {
    if (!mustBeLive || isSuperclassImport(record.source, local)) return `var ${local} = ${sourceObject}.default;`;
    return `var ${local} = __awtsmoosLiveImport(() => ${sourceObject}, "default");`;
  }
  if (specifier.type === "ImportNamespaceSpecifier") {
    return mustBeLive ? `var ${local} = __awtsmoosLiveNamespace(() => ${sourceObject});` : `var ${local} = ${sourceObject};`;
  }
  return "";
}

function isSuperclassImport(source, local) {
  const escaped = String(local).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`extends\\s+${escaped}\\b`).test(source || "");
}

function namedExportReplacement(record, node) {
  const sourceValue = node.source && node.source.value;
  if (sourceValue && record.deps.has(sourceValue)) return sourceReexportReplacement(record, node);
  if (node.declaration) return declarationExportReplacement(record, node.declaration);
  return specifierExportAssignments(node.specifiers, "");
}

function sourceReexportReplacement(record, node) {
  const dep = record.deps.get(node.source.value);
  const specifiers = node.specifiers || [];
  if (!specifiers.length || specifiers.some((item) => item.type === "ExportAllDeclaration")) return `Object.assign(__exports, ${dep.id});`;
  return specifiers.map((specifier) => {
    const local = specifier.local && specifier.local.name;
    const exported = specifier.exported && specifier.exported.name;
    return local && exported ? `__exports.${exported} = ${dep.id}.${local};` : "";
  }).filter(Boolean).join("\n");
}

function exportAllReplacement(record, node) {
  const dep = record.deps.get(node.source && node.source.value);
  return dep ? `Object.assign(__exports, ${dep.id});` : "";
}

function declarationExportReplacement(record, declaration) {
  let text = sourceForNamedDeclaration(record, declaration);
  if (declaration.async && declaration.type === "FunctionDeclaration" && !/^async\b/.test(text.trim())) text = `async ${text}`;
  const assignments = namesFromDeclaration(declaration).map((name) => `__exports.${name} = ${name};`).join("\n");
  return assignments ? `${text}\n${assignments}\n` : text;
}

function specifierExportAssignments(specifiers, prefix) {
  return (specifiers || []).map((specifier) => {
    const local = specifier.local && specifier.local.name;
    const exported = specifier.exported && specifier.exported.name;
    return local && exported ? `__exports.${exported} = ${prefix}${local};` : "";
  }).filter(Boolean).join("\n");
}

function defaultExportReplacement(record, node) {
  const declaration = node.declaration;
  const local = defaultLocalName(record, declaration);
  let source = sourceForDefaultDeclaration(record, declaration, node);
  if (declaration.async && /^function\b/.test(source.trim())) source = `async ${source}`;
  if (declaration.id && declaration.id.name) return `${source}\n__exports.default = ${local};`;
  if (declaration.type === "Identifier") return `__exports.default = ${local};`;
  if (declaration.type === "FunctionExpression") return `function ${local}${source.slice("function".length)}\n__exports.default = ${local};`;
  if (declaration.type === "ClassExpression") return `class ${local}${source.slice("class".length)}\n__exports.default = ${local};`;
  return `const ${local} = ${source};\n__exports.default = ${local};`;
}

function renderEntryExports(entry) {
  const lines = [`/* B\\"H compact entry exports */`];
  for (const name of publicExportNames(entry)) {
    if (name === "default") lines.push(`export default ${entry.id}.default;`);
    else lines.push(`export const ${name} = ${entry.id}.${name};`);
  }
  return lines.join("\n");
}

function publicExportNames(record, seen = new Set()) {
  if (!record || seen.has(record.filePath)) return [];
  seen.add(record.filePath);
  const names = new Set([...(record.exportInfo.names || []), ...inferExportNamesFromSource(record.source)]);
  for (const link of record.links || []) {
    const isStar = link.type === "ExportAllDeclaration" || (link.type === "ExportNamedDeclaration" && (link.specifiers || []).some((item) => item.type === "ExportAllDeclaration"));
    if (isStar) for (const name of publicExportNames(record.deps.get(link.source), seen)) if (name !== "default") names.add(name);
  }
  return [...names];
}

/**
 * B"H
 * Fallback export-name inference from raw source. The Merkava parser sometimes
 * carries declarations enough for body rewriting but not enough for the final
 * public ESM bridge. This keeps compact dynamic imports equivalent to normal
 * imports, so named exports stay visible at the browser module boundary.
 * @param {string} source Raw module source.
 * @returns {string[]} Public export names found in source text.
 */
function inferExportNamesFromSource(source) {
  const names = new Set();
  const text = String(source || "");
  for (const match of text.matchAll(/(?:^|[;\n])\s*export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1]);
  for (const match of text.matchAll(/(?:^|[;\n])\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1]);
  for (const match of text.matchAll(/(?:^|[;\n])\s*export\s*\{([\s\S]*?)\}\s*(?:from\s*["\'][^"\']+["\'])?\s*;?/g)) {
    for (const part of match[1].split(",")) {
      const cleaned = part.trim();
      if (!cleaned || cleaned === "default") continue;
      const alias = cleaned.match(/^(?:[A-Za-z_$][\w$]*|default)\s+as\s+([A-Za-z_$][\w$]*)$/);
      const direct = cleaned.match(/^([A-Za-z_$][\w$]*)$/);
      if (alias) names.add(alias[1]);
      else if (direct) names.add(direct[1]);
    }
  }
  if (/(?:^|[;\n])\s*export\s+default\b/.test(text)) names.add("default");
  return [...names];
}

function exportNamedReplacementEnd(record, node) {
  if (!node.declaration) return node.end;
  const end = findDeclarationEnd(record.source, node.declaration);
  return end > node.start ? end : node.end;
}

function sourceForNamedDeclaration(record, declaration) {
  const end = findDeclarationEnd(record.source, declaration);
  return record.source.slice(declaration.start, end > declaration.start ? end : declaration.end);
}

function sourceForDefaultDeclaration(record, declaration, exportNode = null) {
  if (!declaration) return "undefined";
  const start = defaultDeclarationSourceStart(record.source, declaration, exportNode);
  const end = findDefaultDeclarationSourceEnd(record.source, declaration, start);
  const safeEnd = end > start ? end : declaration.end;
  return record.source.slice(start, stripTrailingSemicolonOffset(record.source, safeEnd));
}

function exportDefaultReplacementEnd(record, node) {
  const declaration = node.declaration;
  const start = declaration ? defaultDeclarationSourceStart(record.source, declaration, node) : node.start;
  const end = declaration ? findDefaultDeclarationSourceEnd(record.source, declaration, start) : node.end;
  return consumeTrailingSemicolon(record.source, end > node.start ? end : node.end);
}

function defaultDeclarationSourceStart(source, declaration, exportNode = null) {
  if (!declaration) return exportNode?.end || 0;
  if (["FunctionDeclaration", "FunctionExpression", "ClassDeclaration", "ClassExpression"].includes(declaration.type)) return declaration.start;
  const afterKeyword = exportNode ? findAfterExportDefault(source, exportNode.start) : -1;
  return afterKeyword >= 0 ? afterKeyword : declaration.start;
}

function findAfterExportDefault(source, start) {
  const match = String(source || "").slice(start).match(/^\s*export\s+default\b/);
  return match ? skipWhitespace(source, start + match[0].length) : -1;
}

function findDefaultDeclarationSourceEnd(source, declaration, sourceStart = declaration?.start || 0) {
  if (!declaration) return -1;
  if (["FunctionDeclaration", "FunctionExpression", "ClassDeclaration", "ClassExpression"].includes(declaration.type)) {
    const end = findFunctionLikeEnd(source, declaration.start);
    return end > 0 ? end : declaration.end;
  }
  return findStatementEnd(source, sourceStart);
}

function replaceRemainingDefaultExports(source) {
  const text = String(source || "");
  const pattern = /(^|[;\n])\s*export\s+default\s+/g;
  let output = "", cursor = 0, match, count = 0;
  while ((match = pattern.exec(text))) {
    if (!isTopLevelExportBoundary(text, match.index)) continue;
    const start = pattern.lastIndex;
    const end = findDefaultExportExpressionEnd(text, start);
    if (end <= start) continue;
    count++;
    output += text.slice(cursor, match.index) + match[1] + `__exports.default = ${text.slice(start, end).trim()};`;
    cursor = consumeTrailingSemicolon(text, end);
    pattern.lastIndex = cursor;
  }
  return count ? output + text.slice(cursor) : text;
}

function replaceRemainingExportDeclarations(source) {
  const names = [];
  let output = String(source || "");
  output = output.replace(/(^|[;\n])\s*export\s+(async\s+function\s+|function\s+|class\s+)([A-Za-z_$][\w$]*)/g, (_m, p, k, n) => {
    names.push(n);
    return p + k + n;
  });
  output = output.replace(/(^|[;\n])\s*export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (_m, p, k, n) => {
    names.push(n);
    return p + k + " " + n;
  });
  return names.length ? output + "\n" + [...new Set(names)].map((name) => `__exports.${name} = ${name};`).join("\n") : output;
}

function replaceRemainingExportLists(source) {
  const text = String(source || "");
  return text.replace(/(^|[;\n])\s*export\s*\{([\s\S]*?)\}\s*;?/g, (_m, prefix, names) => {
    const lines = names.split(",").map((part) => part.trim()).filter(Boolean).map((part) => {
      const alias = part.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      const local = alias ? alias[1] : part;
      const exported = alias ? alias[2] : part;
      return /^[A-Za-z_$][\w$]*$/.test(local) && /^[A-Za-z_$][\w$]*$/.test(exported) ? `__exports.${exported} = ${local};` : "";
    }).filter(Boolean);
    return prefix + lines.join("\n");
  });
}

function isTopLevelExportBoundary(source, offset) {
  if (offset <= 0) return true;
  const stack = [];
  for (let index = 0; index < offset; index++) {
    const char = source[index], next = source[index + 1];
    if (char === "\\") index++;
    else if (char === "'" || char === '"') {
      const end = skipQuotedString(source, index, char);
      if (end >= offset) return false;
      index = end;
    } else if (char === "`") {
      const end = findTemplateLiteralEnd(source, index);
      if (end < 0 || end > offset) return false;
      index = end - 1;
    } else if (char === "/" && (next === "/" || next === "*")) {
      const end = skipComment(source, index, next);
      if (end >= offset) return false;
      index = end;
    } else if ("{[(".includes(char)) stack.push(char);
    else if ((char === "}" && stack.at(-1) === "{") || (char === "]" && stack.at(-1) === "[") || (char === ")" && stack.at(-1) === "(")) stack.pop();
  }
  return stack.length === 0;
}

function applyReplacements(source, replacements) {
  let output = source;
  for (const [start, end, replacement] of replacements.filter(([s, e]) => Number.isFinite(s) && Number.isFinite(e)).sort((a, b) => b[0] - a[0])) {
    output = output.slice(0, start) + replacement + output.slice(end);
  }
  return output;
}

function findDeclarationEnd(source, declaration) {
  if (!declaration) return -1;
  if (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
    const end = findFunctionLikeEnd(source, declaration.start);
    return consumeTrailingSemicolon(source, end > 0 ? end : declaration.end);
  }
  if (declaration.type === "VariableDeclaration") return findStatementEnd(source, declaration.start);
  return declaration.end;
}

function findStatementEnd(source, start) {
  const stack = [];
  for (let index = start; index < source.length; index++) {
    const char = source[index], next = source[index + 1];
    if (char === "\\") index++;
    else if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
    else if (char === "`") { const end = findTemplateLiteralEnd(source, index); if (end < 0) return -1; index = end - 1; }
    else if (char === "/" && (next === "/" || next === "*")) index = skipComment(source, index, next);
    else if ("{[(".includes(char)) stack.push(char);
    else if ((char === "}" && stack.at(-1) === "{") || (char === "]" && stack.at(-1) === "[") || (char === ")" && stack.at(-1) === "(")) stack.pop();
    else if (char === ";" && !stack.length) return index + 1;
  }
  return source.length;
}

function findDefaultExportExpressionEnd(source, start) {
  const index = skipWhitespace(source, start);
  if (source[index] === "`") return findTemplateLiteralEnd(source, index);
  if ("{[(".includes(source[index])) return findBalancedExpressionEnd(source, index);
  if (/^(async\s+)?function\b/.test(source.slice(index)) || /^class\b/.test(source.slice(index))) return findFunctionLikeEnd(source, index);
  const semi = source.indexOf(";", index);
  const line = source.indexOf("\n", index);
  if (semi < 0) return line < 0 ? source.length : line;
  return line >= 0 && line < semi ? line : semi;
}

function findFunctionLikeEnd(source, start) {
  let parenDepth = 0;
  for (let index = start; index < source.length; index++) {
    const char = source[index], next = source[index + 1];
    if (char === "\\") index++;
    else if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
    else if (char === "`") { const end = findTemplateLiteralEnd(source, index); if (end < 0) return -1; index = end - 1; }
    else if (char === "/" && (next === "/" || next === "*")) index = skipComment(source, index, next);
    else if (char === "(") parenDepth++;
    else if (char === ")" && parenDepth > 0) parenDepth--;
    else if (char === "{" && parenDepth === 0) return findBalancedExpressionEnd(source, index);
  }
  return -1;
}

function findBalancedExpressionEnd(source, start) {
  const open = source[start];
  const close = open === "{" ? "}" : open === "[" ? "]" : ")";
  let depth = 1;
  for (let index = start + 1; index < source.length; index++) {
    const char = source[index], next = source[index + 1];
    if (char === "\\") index++;
    else if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
    else if (char === "`") { const end = findTemplateLiteralEnd(source, index); if (end < 0) return -1; index = end - 1; }
    else if (char === "/" && (next === "/" || next === "*")) index = skipComment(source, index, next);
    else if (char === open) depth++;
    else if (char === close && --depth === 0) return index + 1;
  }
  return -1;
}

function findTemplateLiteralEnd(source, start) {
  if (source[start] !== "`") return -1;
  for (let index = start + 1; index < source.length; index++) {
    const char = source[index];
    if (char === "\\") index++;
    else if (char === "`") return index + 1;
    else if (char === "$" && source[index + 1] === "{") { index = skipTemplateExpression(source, index + 2); if (index < 0) return -1; }
  }
  return -1;
}

function skipTemplateExpression(source, start) {
  let depth = 1;
  for (let index = start; index < source.length; index++) {
    const char = source[index], next = source[index + 1];
    if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
    else if (char === "`") { const end = findTemplateLiteralEnd(source, index); if (end < 0) return -1; index = end - 1; }
    else if (char === "/" && (next === "/" || next === "*")) index = skipComment(source, index, next);
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return index;
    else if (char === "\\") index++;
  }
  return -1;
}

function skipQuotedString(source, start, quote) {
  for (let index = start + 1; index < source.length; index++) {
    if (source[index] === "\\") index++;
    else if (source[index] === quote) return index;
  }
  return source.length - 1;
}

function skipComment(source, start, kind) {
  if (kind === "/") {
    const end = source.indexOf("\n", start + 2);
    return end < 0 ? source.length - 1 : end;
  }
  const end = source.indexOf("*/", start + 2);
  return end < 0 ? source.length - 1 : end + 1;
}

function skipWhitespace(source, start) {
  let index = start;
  while (/\s/.test(source[index] || "")) index++;
  return index;
}

function consumeTrailingSemicolon(source, start) {
  let index = skipWhitespace(source, start);
  if (source[index] === ";") index++;
  return index;
}

function stripTrailingSemicolonOffset(source, end) {
  let index = end;
  while (/\s/.test(source[index - 1] || "")) index--;
  return source[index - 1] === ";" ? index - 1 : index;
}

function namesFromDeclaration(declaration) {
  if (!declaration) return [];
  if (declaration.id && declaration.id.name) return [declaration.id.name];
  if (!Array.isArray(declaration.declarations)) return [];
  const names = [];
  for (const item of declaration.declarations) addPatternNames(item.id, names);
  return names;
}

function addPatternNames(node, names) {
  if (!node) return;
  if (node.type === "Identifier" && node.name) names.push(node.name);
  if (Array.isArray(node.elements)) node.elements.forEach((item) => addPatternNames(item, names));
  if (Array.isArray(node.properties)) node.properties.forEach((item) => addPatternNames(item.value || item.argument, names));
}

function defaultLocalName(record, declaration) {
  if (declaration.id && declaration.id.name) return declaration.id.name;
  if (declaration.type === "Identifier" && declaration.name) return declaration.name;
  return defaultSymbolForFile(record.filePath);
}

function defaultSymbolForFile(filePath) {
  let hash = 0;
  for (const char of String(filePath || "")) hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  return `__awtsmoosDefault_${hash.toString(36)}`;
}

function slash(value) {
  return String(value || "").split(path.sep).join("/");
}

module.exports = {
  addFileToCompactModule,
  compileCompactModule,
  renderCompactModule,
  wrapChunk: (filePath, rootDir, body) => {
    const relative = slash(path.relative(rootDir, filePath));
    return `\n/* B\\"H compact source: ${relative} */\n${body}\n`;
  }
};
