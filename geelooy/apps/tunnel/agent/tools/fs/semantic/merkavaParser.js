// B"H
const path = require("path");
const fs = require("fs");

const DEFAULT_AWTSMOOS_ORIGIN = "https://awtsmoos.com";
const MERKAVA_PARSER_DIR = "/scripts/awtsmoos/MerkavaASTParser/";
const MERKAVA_FILES = [
  "constants.js",
  "node_helpers.js",
  "Lexer.js",
  "parser-expressions.js",
  "parser-statements.js",
  "parser-declarations.js",
  "parser-core.js"
];

let merkavaPromise = null;

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed loading ${url}: HTTP ${response.status}`);
  return response.text();
}

function normalizeMerkavaName(name) {
  return String(name || "").replace(/^\.\//, "").replace(/\\/g, "/");
}

/**
 * B"H
 * Chapter 2: The chariot refused the false road.
 *
 * The parser-core file is a CommonJS/browser bridge. In Node it asks for
 * ./constants.js and ./Lexer.js with synchronous require calls. Installed
 * agents must not answer those calls from C:\\scripts or any random cwd; this
 * tiny in-memory module table makes every relative Merkava dependency resolve
 * from awtsmoos.com/scripts/awtsmoos/MerkavaASTParser.
 *
 * @param {Record<string,string>} sources Remote JavaScript sources by file name.
 * @param {string} baseUrl Canonical remote directory URL.
 * @returns {Promise<Function>} Resolved MerkavahParser class.
 */
async function evaluateRemoteMerkavaBundle(sources, baseUrl) {
  const cache = new Map();
  const host = globalThis;

  function remoteRequire(request) {
    const name = normalizeMerkavaName(request);
    if (cache.has(name)) return cache.get(name).exports;
    const source = sources[name];
    if (!source) throw new Error(`Merkava remote dependency missing: ${name}`);

    const module = { exports: {} };
    cache.set(name, module);
    const runner = new Function(
      "module",
      "exports",
      "require",
      "globalThis",
      "self",
      `${source}\n//# sourceURL=${new URL(name, baseUrl).href}`
    );
    runner(module, module.exports, remoteRequire, host, host);
    return module.exports;
  }

  return await remoteRequire("parser-core.js");
}

/**
 * B"H
 * Fetches the canonical parser bundle from awtsmoos.com so installed agents do
 * not depend on impossible absolute paths. The local process becomes only the
 * receiver; the authoritative letters remain under awtsmoos.com/scripts.
 *
 * @param {string} origin Awtsmoos origin.
 * @returns {Promise<Function>} MerkavahParser class.
 */
async function loadParserFromAwtsmoos(origin = DEFAULT_AWTSMOOS_ORIGIN) {
  const baseUrl = new URL(MERKAVA_PARSER_DIR, origin).href;
  const entries = await Promise.all(
    MERKAVA_FILES.map(async (name) => [name, await fetchText(new URL(name, baseUrl).href)])
  );
  return evaluateRemoteMerkavaBundle(Object.fromEntries(entries), baseUrl);
}

/**
 * B"H
 * Uses a repo-local parser only when the agent source itself lives inside an
 * awtsmoos.com checkout. This is development-only kindness, never the installed
 * agent's required path.
 *
 * @returns {Promise<Function|null>} Parser class or null.
 */
async function loadRepoLocalParserIfPresent() {
  const repoPath = path.resolve(__dirname, "../../../../../../scripts/awtsmoos/MerkavaASTParser/parser-core.js");
  if (!repoPath.includes(`${path.sep}awtsmoos.com${path.sep}`)) return null;
  if (!fs.existsSync(repoPath)) return null;
  return await require(repoPath);
}

/**
 * B"H
 * Loads the Merkava parser once for the local agent.
 *
 * @param {object} [options] Loader options.
 * @param {string} [options.origin] Awtsmoos origin.
 * @returns {Promise<Function>} The assembled MerkavahParser class.
 */
async function loadMerkavaParser(options = {}) {
  if (!merkavaPromise) {
    merkavaPromise = (async () => {
      const local = await loadRepoLocalParserIfPresent();
      if (local) return local;
      return loadParserFromAwtsmoos(options.origin || process.env.AWTSMOOS_BASE_URL || DEFAULT_AWTSMOOS_ORIGIN);
    })();
  }
  return await merkavaPromise;
}

/**
 * B"H
 * Parses JavaScript through Merkava and returns both tree and parser errors.
 *
 * @param {string} text Source code.
 * @returns {Promise<{ok:boolean, ast?:object, errors:string[], error?:string}>}
 */
async function parseWithMerkava(text) {
  try {
    const Parser = await loadMerkavaParser();
    const parser = new Parser(String(text || ""));
    const ast = parser.parse();
    return { ok: true, ast, errors: parser.errors || [] };
  } catch (e) {
    return { ok: false, errors: [], error: e && e.message ? e.message : String(e) };
  }
}

module.exports = { loadMerkavaParser, parseWithMerkava, loadParserFromAwtsmoos };
