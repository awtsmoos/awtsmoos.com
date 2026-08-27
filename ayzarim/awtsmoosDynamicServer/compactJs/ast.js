// B"H

const path = require("path");

const parserPath = path.resolve(
  __dirname,
  "../../../geelooy/scripts/awtsmoos/MerkavaASTParser/parser-core.js"
);

let parserPromise;

/**
 * B"H
 * The Chariot is not seized by force. The Awtsmoos lets the existing Merkava
 * parser keep its public shape: a Promise from CommonJS. This wrapper only
 * remembers that promise, awaits it, and then builds a parser instance.
 *
 * @param {string} source JavaScript source to parse.
 * @returns {Promise<object>} ESTree-like Program node.
 */
async function parseJavaScript(source) {
  if (!parserPromise) {
    parserPromise = require(parserPath);
  }

  const Parser = await parserPromise;
  const parser = new Parser(String(source || ""));
  return parser.parse();
}

module.exports = { parseJavaScript, parserPath };
