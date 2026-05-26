// B"H
const { compileJsonCode, compileJsonToSang } = require('./MerkavaJsonCompiler.js');
const { runSang } = require('./SangVmRunner.js');

/**
 * Executes raw JSON Merkava code through the custom VM.
 * The JSON remains human/AI readable; execution still descends into opcodes,
 * so later binary transport is a smaller garment over the same living soul.
 */
function runJsonCode(program, options = {}) {
  return runSang(compileJsonCode(program), options);
}

function runJsonAsSang(program, options = {}) {
  return runSang(compileJsonToSang(program), options);
}

module.exports = { runJsonCode, runJsonAsSang };
