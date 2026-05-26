// B"H
const { compileJsToCode, compileJsToSang } = require('./MerkavaJsCompiler.js');
const { runSang } = require('./SangVmRunner.js');

/**
 * Runs raw JS proof code without evaluating the source string.
 * The JS is parsed by MerkavaASTParser, lowered to JSON IR, compiled to
 * VM bytecode, and then run by the custom Merkava VM.
 */
async function runJsCode(source, options = {}) {
  return runSang(await compileJsToCode(source), options);
}

async function runJsAsSang(source, options = {}) {
  return runSang(await compileJsToSang(source), options);
}

module.exports = { runJsCode, runJsAsSang };
