// B"H
const { lowerAstToJson } = require('./MerkavaAstLowerer.js');
const { compileJsonCode, compileJsonToSang } = require('./MerkavaJsonCompiler.js');
const { encodeSangArtifact } = require('./SangCodec.js');
const { tryCompileCompactClasses } = require('./CompactClassCodec.js');
const { astToCompactClassBinary } = require('./CompactClassBinary.js');
const { assertBasicJsSyntax } = require('./MerkavaSyntaxPreflight.js');

async function parseJs(source) {
  const Parser = await require('../../MerkavaASTParser/parser-core.js');
  const parser = new Parser(source);
  return parser.parse();
}
function onlyClasses(ast) {
  return (ast.body || []).length > 0 && (ast.body || []).every(stmt => stmt.type === 'ClassDeclaration');
}

async function compileJsToJson(source, options = {}) {
  return lowerAstToJson(await parseJs(source, options.file || options.filename || options.path || '<inline>'));
}

async function compileJsToCode(source, options = {}) {
  const ast = await parseJs(source, options.file || options.filename || options.path || '<inline>');
  const compact = onlyClasses(ast) ? tryCompileCompactClasses(ast) : null;
  return compact || compileJsonCode(lowerAstToJson(ast));
}

async function compileJsToSang(source, options = {}) {
  const ast = await parseJs(source, options.file || options.filename || options.path || '<inline>');
  if (onlyClasses(ast)) return astToCompactClassBinary(ast, options);
  return encodeSangArtifact(compileJsonCode(lowerAstToJson(ast)));
}

module.exports = { parseJs, compileJsToJson, compileJsToCode, compileJsToSang };
