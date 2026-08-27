// B"H

/**
 * B"H
 * A module link is a doorway: sometimes it says `import`, sometimes it says
 * `export ... from`. The Awtsmoos sees both silver threads and gathers only
 * the local ones, leaving bare package names untouched like sealed stars.
 *
 * @param {object} ast ESTree-like Program node.
 * @returns {Array<object>} Top-level source-bearing module links.
 */
function collectTopLevelModuleLinks(ast) {
  if (!ast || !Array.isArray(ast.body)) return [];

  return ast.body
    .filter((node) => node && node.source && typeof node.source.value === "string")
    .filter((node) => node.type === "ImportDeclaration" || isSourceExport(node))
    .map((node) => ({
      type: node.type,
      source: node.source.value,
      start: Number(node.start),
      end: Number(node.end),
      specifiers: Array.isArray(node.specifiers) ? node.specifiers : []
    }))
    .filter((item) => typeof item.source === "string");
}

/**
 * B"H
 * Keeps old public helper behavior: callers asking for imports receive imports.
 *
 * @param {object} ast ESTree-like Program node.
 * @returns {Array<object>} Import records.
 */
function collectTopLevelImports(ast) {
  return collectTopLevelModuleLinks(ast)
    .filter((item) => item.type === "ImportDeclaration")
    .map((item) => ({
      source: item.source,
      start: item.start,
      end: item.end,
      specifiers: item.specifiers
    }));
}

/**
 * B"H
 * Reads export names from a module so namespace imports and default aliases can
 * keep breathing after local import declarations are folded into one response.
 *
 * @param {object} ast ESTree-like Program node.
 * @returns {{names:string[], defaultLocal:string|null}} Export metadata.
 */
function collectTopLevelExports(ast) {
  const found = new Set();
  let defaultLocal = null;
  if (!ast || !Array.isArray(ast.body)) return { names: [], defaultLocal };

  for (const node of ast.body) {
    if (!node) continue;
    if (node.type === "ExportNamedDeclaration") addNamedExport(node, found);
    if (node.type === "ExportDefaultDeclaration") {
      found.add("default");
      defaultLocal = localNameForDefault(node.declaration) || defaultLocal;
    }
  }

  return { names: [...found], defaultLocal };
}

/**
 * B"H
 * Identifies export declarations that point at another module.
 *
 * @param {object} node AST node.
 * @returns {boolean} True for source-bearing export declarations.
 */
function isSourceExport(node) {
  return node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration";
}

/**
 * B"H
 * Replaces selected top-level module-link declarations. External imports and
 * external re-exports remain, so package/module-map behavior is unchanged.
 *
 * @param {string} source JavaScript source.
 * @param {Array<object>} links Module links.
 * @param {(link:object)=>boolean} shouldReplace Predicate.
 * @param {(link:object)=>string} makeReplacement Replacement text.
 * @returns {string} Source with selected declarations replaced.
 */
function replaceSelectedModuleLinks(source, links, shouldReplace, makeReplacement) {
  const ranges = links
    .filter((item) => shouldReplace(item))
    .map((item) => [item.start, item.end, makeReplacement(item)])
    .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end))
    .sort((a, b) => b[0] - a[0]);

  let output = String(source || "");
  for (const [start, end, replacement] of ranges) {
    output = output.slice(0, start) + replacement + output.slice(end);
  }
  return output;
}

/**
 * B"H
 * Backward-compatible remover for older tests and callers.
 *
 * @param {string} source JavaScript source.
 * @param {Array<object>} links Module links.
 * @param {(source:string)=>boolean} shouldRemove Predicate.
 * @returns {string} Source with selected declarations removed.
 */
function removeSelectedModuleLinks(source, links, shouldRemove) {
  return replaceSelectedModuleLinks(
    source,
    links,
    (item) => shouldRemove(item.source),
    () => ""
  );
}

function removeSelectedImports(source, imports, shouldRemove) {
  return removeSelectedModuleLinks(source, imports, shouldRemove);
}

function addNamedExport(node, found) {
  if (node.specifiers && node.specifiers.length) {
    for (const specifier of node.specifiers) {
      const name = specifier.exported && specifier.exported.name;
      if (name) found.add(name);
    }
  }

  const declaration = node.declaration;
  if (!declaration) return;
  if (declaration.id && declaration.id.name) found.add(declaration.id.name);
  if (Array.isArray(declaration.declarations)) {
    for (const item of declaration.declarations) addPatternNames(item.id, found);
  }
}

function addPatternNames(node, found) {
  if (!node) return;
  if (node.type === "Identifier" && node.name) found.add(node.name);
  if (Array.isArray(node.elements)) node.elements.forEach((item) => addPatternNames(item, found));
  if (Array.isArray(node.properties)) {
    node.properties.forEach((item) => addPatternNames(item.value || item.argument, found));
  }
}

function localNameForDefault(declaration) {
  if (!declaration) return null;
  if (declaration.id && declaration.id.name) return declaration.id.name;
  if (declaration.type === "Identifier" && declaration.name) return declaration.name;
  return null;
}

module.exports = {
  collectTopLevelExports,
  collectTopLevelImports,
  collectTopLevelModuleLinks,
  removeSelectedImports,
  removeSelectedModuleLinks,
  replaceSelectedModuleLinks
};
