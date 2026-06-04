// B"H

const path = require("path");
const { parseJavaScript } = require("./ast.js");
const { collectTopLevelExports, collectTopLevelModuleLinks } = require("./imports.js");
const { isLocalImport, resolveLocalImport } = require("./paths.js");

/**
 * B"H
 * The compact flame carries local files inside private chambers while external
 * packages remain true ESM imports at the top gate. Thus `three` stays a real
 * browser/package import, but every local path is folded into one response.
 *
 * @param {object} options Compiler options.
 * @param {object} options.fs Promise-style filesystem dependency.
 * @param {string} options.entryFile Absolute JS file requested by the client.
 * @param {string} options.rootDir Absolute root directory allowed for tracing.
 * @returns {Promise<string>} One JavaScript module response body.
 */
async function compileCompactModule({ fs, entryFile, rootDir }) {
  const entry = path.resolve(entryFile);
  const state = {
    fs,
    entryFile: entry,
    rootDir: path.resolve(rootDir),
    modules: [],
    modulesByFile: new Map(),
    externals: new Map()
  };

  await addFileToCompactModule(state, entry);
  return renderCompactModule(state);
}

/**
 * B"H
 * Reads one module, records it, then recursively records its local graph.
 *
 * @param {object} state Compiler state.
 * @param {string} filePath Absolute file path.
 * @returns {Promise<object>} Module record.
 */
async function addFileToCompactModule(state, filePath) {
  if (state.modulesByFile.has(filePath)) return state.modulesByFile.get(filePath);

  const source = await state.fs.readFile(filePath, "utf-8");
  const ast = await parseJavaScript(source);
  const record = {
    id: `__awtsmoosModule_${state.modules.length}`,
    filePath,
    source,
    ast,
    links: collectTopLevelModuleLinks(ast),
    exportInfo: collectTopLevelExports(ast),
    deps: new Map(),
    externalDeps: new Map()
  };

  state.modulesByFile.set(filePath, record);
  state.modules.push(record);

  for (const link of record.links) {
    if (isLocalImport(link.source)) {
      const resolved = resolveLocalImport({
        fromFile: filePath,
        source: link.source,
        rootDir: state.rootDir
      });
      if (!resolved) continue;
      record.deps.set(link.source, await addFileToCompactModule(state, resolved));
    } else if (link.type === "ImportDeclaration") {
      record.externalDeps.set(link.source, externalRecordFor(state, link.source));
    }
  }

  return record;
}

/**
 * B"H
 * Registers one external ESM source and assigns a namespace import symbol.
 *
 * @param {object} state Compiler state.
 * @param {string} source Import source.
 * @returns {{source:string,id:string}} External record.
 */
function externalRecordFor(state, source) {
  if (state.externals.has(source)) return state.externals.get(source);
  const record = { source, id: `__awtsmoosExternal_${state.externals.size}` };
  state.externals.set(source, record);
  return record;
}

/**
 * B"H
 * Renders external gates, dependency chambers, then entry exports.
 *
 * @param {object} state Compiler state.
 * @returns {string} Compiled source.
 */
function renderCompactModule(state) {
  const entry = state.modulesByFile.get(state.entryFile);
  const ordered = dependencyFirstOrder(entry);
  return [
    ...renderExternalImports(state),
    ...ordered.map((record) => renderScopedModule(state, record)),
    renderEntryExports(entry)
  ].filter(Boolean).join("\n");
}

/**
 * B"H
 * External imports remain top-level so the browser/module loader may resolve
 * package maps, CDNs, and import maps exactly as before.
 *
 * @param {object} state Compiler state.
 * @returns {string[]} Import declarations.
 */
function renderExternalImports(state) {
  return [...state.externals.values()].map((item) => {
    return `import * as ${item.id} from ${JSON.stringify(item.source)};`;
  });
}

/**
 * B"H
 * Makes a dependency-first order from the entry graph.
 *
 * @param {object} entry Entry module record.
 * @returns {object[]} Ordered module records.
 */
function dependencyFirstOrder(entry) {
  const seen = new Set();
  const ordered = [];

  function visit(record) {
    if (!record || seen.has(record.filePath)) return;
    seen.add(record.filePath);
    for (const child of record.deps.values()) visit(child);
    ordered.push(record);
  }

  visit(entry);
  return ordered;
}

/**
 * B"H
 * Wraps one source file in an isolated scope and returns its export object.
 *
 * @param {object} state Compiler state.
 * @param {object} record Module record.
 * @returns {string} Scoped module source.
 */
function renderScopedModule(state, record) {
  const relative = path.relative(state.rootDir, record.filePath).split(path.sep).join("/");
  const body = transformModuleBody(record).trim();
  return [
    `/* B\"H compact source: ${relative} */`,
    `const ${record.id} = (() => {`,
    `const __exports = {};`,
    body,
    `return Object.freeze(__exports);`,
    `})();`
  ].join("\n");
}

/**
 * B"H
 * Replaces import/export declarations inside a private module chamber.
 *
 * @param {object} record Module record.
 * @returns {string} Transformed body.
 */
function transformModuleBody(record) {
  const replacements = [];
  for (const node of record.ast.body || []) {
    if (node.type === "ImportDeclaration") {
      replacements.push([node.start, node.end, importReplacement(record, node)]);
    } else if (node.type === "ExportNamedDeclaration") {
      replacements.push([node.start, node.end, namedExportReplacement(record, node)]);
    } else if (node.type === "ExportDefaultDeclaration") {
      replacements.push([node.start, node.end, defaultExportReplacement(record, node)]);
    }
  }
  return applyReplacements(record.source, replacements);
}

/**
 * B"H
 * Converts one import into local bindings from a local dependency export object
 * or a top-level external namespace import.
 *
 * @param {object} record Module record.
 * @param {object} node ImportDeclaration node.
 * @returns {string} Replacement source.
 */
function importReplacement(record, node) {
  const source = node.source && node.source.value;
  const dep = record.deps.get(source);
  const external = record.externalDeps.get(source);
  const sourceObject = dep ? dep.id : external && external.id;
  if (!sourceObject) return record.source.slice(node.start, node.end);

  const lines = [];
  for (const specifier of node.specifiers || []) {
    const local = specifier.local && specifier.local.name;
    if (!local) continue;
    if (specifier.type === "ImportSpecifier") {
      const imported = specifier.imported && specifier.imported.name;
      if (imported) lines.push(`const ${local} = ${sourceObject}.${imported};`);
    } else if (specifier.type === "ImportDefaultSpecifier") {
      lines.push(`const ${local} = ${sourceObject}.default;`);
    } else if (specifier.type === "ImportNamespaceSpecifier") {
      lines.push(`const ${local} = ${sourceObject};`);
    }
  }
  return lines.join("\n");
}

/**
 * B"H
 * Converts named exports and source re-exports into export-object writes.
 *
 * @param {object} record Module record.
 * @param {object} node ExportNamedDeclaration node.
 * @returns {string} Replacement source.
 */
function namedExportReplacement(record, node) {
  const sourceValue = node.source && node.source.value;
  if (sourceValue && record.deps.has(sourceValue)) return sourceReexportReplacement(record, node);
  if (node.declaration) return declarationExportReplacement(record, node.declaration);
  return specifierExportAssignments(node.specifiers, "");
}

function sourceReexportReplacement(record, node) {
  const dep = record.deps.get(node.source.value);
  const specifiers = node.specifiers || [];
  if (!specifiers.length) return `Object.assign(__exports, ${dep.id});`;

  return specifiers.map((specifier) => {
    const local = specifier.local && specifier.local.name;
    const exported = specifier.exported && specifier.exported.name;
    return local && exported ? `__exports.${exported} = ${dep.id}.${local};` : "";
  }).filter(Boolean).join("\n");
}

function declarationExportReplacement(record, declaration) {
  let text = record.source.slice(declaration.start, declaration.end);
  if (declaration.async && declaration.type === "FunctionDeclaration" && !/^async\b/.test(text.trim())) {
    text = `async ${text}`;
  }
  const names = namesFromDeclaration(declaration);
  const assignments = names.map((name) => `__exports.${name} = ${name};`).join("\n");
  return assignments ? `${text}\n${assignments}` : text;
}

function specifierExportAssignments(specifiers, prefix) {
  return (specifiers || []).map((specifier) => {
    const local = specifier.local && specifier.local.name;
    const exported = specifier.exported && specifier.exported.name;
    return local && exported ? `__exports.${exported} = ${prefix}${local};` : "";
  }).filter(Boolean).join("\n");
}

/**
 * B"H
 * Converts a default export into a local binding plus `__exports.default`.
 *
 * @param {object} record Module record.
 * @param {object} node ExportDefaultDeclaration node.
 * @returns {string} Replacement source.
 */
function defaultExportReplacement(record, node) {
  const declaration = node.declaration;
  const local = defaultLocalName(record, declaration);
  let source = record.source.slice(declaration.start, declaration.end);
  if (declaration.async && /^function\b/.test(source.trim())) source = `async ${source}`;

  if (declaration.id && declaration.id.name) return `${source}\n__exports.default = ${local};`;
  if (declaration.type === "Identifier") return `__exports.default = ${local};`;
  if (declaration.type === "FunctionExpression") return `function ${local}${source.slice("function".length)}\n__exports.default = ${local};`;
  if (declaration.type === "ClassExpression") return `class ${local}${source.slice("class".length)}\n__exports.default = ${local};`;
  return `const ${local} = ${source};\n__exports.default = ${local};`;
}

function defaultLocalName(record, declaration) {
  if (declaration.id && declaration.id.name) return declaration.id.name;
  if (declaration.type === "Identifier" && declaration.name) return declaration.name;
  return defaultSymbolForFile(record.filePath);
}

/**
 * B"H
 * Emits only the requested entry's public exports from the compact response.
 *
 * @param {object} entry Entry module record.
 * @returns {string} Entry export bridge.
 */
function renderEntryExports(entry) {
  const names = entry.exportInfo.names || [];
  const lines = [`/* B\"H compact entry exports */`];
  for (const name of names) {
    if (name === "default") lines.push(`export default ${entry.id}.default;`);
    else lines.push(`export const ${name} = ${entry.id}.${name};`);
  }
  return lines.join("\n");
}

function applyReplacements(source, replacements) {
  const sorted = replacements
    .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end))
    .sort((a, b) => b[0] - a[0]);
  let output = source;
  for (const [start, end, replacement] of sorted) {
    output = output.slice(0, start) + replacement + output.slice(end);
  }
  return output;
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
  if (Array.isArray(node.properties)) {
    node.properties.forEach((item) => addPatternNames(item.value || item.argument, names));
  }
}

/**
 * B"H
 * Creates a deterministic local symbol from a path.
 *
 * @param {string} filePath Absolute file path.
 * @returns {string} Generated identifier.
 */
function defaultSymbolForFile(filePath) {
  let hash = 0;
  const text = String(filePath || "");
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) >>> 0;
  }
  return `__awtsmoosDefault_${hash.toString(36)}`;
}

/**
 * B"H
 * Old imports expect these public helpers.
 */
module.exports = {
  addFileToCompactModule,
  compileCompactModule,
  renderCompactModule,
  wrapChunk: (filePath, rootDir, body) => {
    const relative = path.relative(rootDir, filePath).split(path.sep).join("/");
    return `\n/* B\"H compact source: ${relative} */\n${body}\n`;
  }
};
