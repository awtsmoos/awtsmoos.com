// B"H
const path = require("path");

let merkavaPromise = null;

/**
 * B"H
 * Loads the Merkava parser once for the local agent.
 *
 * The Awtsmoos breathes through one hidden chariot here: browser parsing keeps
 * its old promise/global API, while Node actions receive the same parser without
 * demanding a browser window.
 *
 * @returns {Promise<Function>} The assembled MerkavahParser class.
 */
async function loadMerkavaParser() {
  if (!merkavaPromise) {
    const parserPath = path.join(
      __dirname,
      "../../../../../../scripts/awtsmoos/MerkavaASTParser/parser-core.js"
    );
    merkavaPromise = Promise.resolve(require(parserPath));
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

module.exports = { loadMerkavaParser, parseWithMerkava };
