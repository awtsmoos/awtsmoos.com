// B"H
const { lowerAstToJson } = require('./MerkavaAstLowerer.js');
const { compileJsonCode } = require('./MerkavaJsonCompiler.js');
const { encodeSangArtifact } = require('./SangCodec.js');
const { tryCompileCompactClasses } = require('./CompactClassCodec.js');
const { astToCompactClassBinary } = require('./CompactClassBinary.js');
const { assertBasicJsSyntax } = require('./MerkavaSyntaxPreflight.js');

function compileFileName(options = {}) {
  return options.file || options.filename || options.path || '<inline>';
}

async function parseJs(source, options = {}) {
  const file = typeof options === 'string' ? options : compileFileName(options);
  assertBasicJsSyntax(source, file);
  const Parser = await require('../../MerkavaASTParser/parser-core.js');
  const parser = new Parser(source);
  try {
    return parser.parse();
  } catch (error) {
    error.code = error.code || 'MERKAVA_JS_PARSE_ERROR';
    error.file = error.file || file;
    throw error;
  }
}

function onlyClasses(ast) {
  return (ast.body || []).length > 0 && (ast.body || []).every(stmt => stmt.type === 'ClassDeclaration');
}

/**
 * B"H
 * Chapter 108: the scroll is checked before it becomes fire.
 *
 * Every JavaScript-to-Merkava route now passes through syntax preflight before
 * AST lowering, so bytecode execution is never blamed for a broken source file.
 */
async function compileJsToJson(source, options = {}) {
  return lowerAstToJson(await parseJs(source, options));
}

async function compileJsToCode(source, options = {}) {
  const ast = await parseJs(source, options);
  const compact = onlyClasses(ast) ? tryCompileCompactClasses(ast) : null;
  return compact || compileJsonCode(lowerAstToJson(ast));
}

async function compileJsToSang(source, options = {}) {
  const ast = await parseJs(source, options);
  if (onlyClasses(ast)) return astToCompactClassBinary(ast, options);
  return encodeSangArtifact(compileJsonCode(lowerAstToJson(ast)));
}

module.exports = { parseJs, compileJsToJson, compileJsToCode, compileJsToSang };
