// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsCompiler.js';
let text = fs.readFileSync(file, 'utf8');
if (!text.includes('MerkavaSyntaxPreflight')) {
  text = text.replace(
    "const { astToCompactClassBinary } = require('./CompactClassBinary.js');",
    "const { astToCompactClassBinary } = require('./CompactClassBinary.js');\nconst { assertBasicJsSyntax } = require('./MerkavaSyntaxPreflight.js');"
  );
}
text = text.replace(
`async function parseJs(source) {
  const Parser = await require('../../MerkavaASTParser/parser-core.js');
  const parser = new Parser(source);
  return parser.parse();
}`,
`async function parseJs(source, file = '<anonymous>') {
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
}`
);
text = text.replace('return lowerAstToJson(await parseJs(source));', 'return lowerAstToJson(await parseJs(source, options.file || options.filename || options.path || \'<inline>\'));');
text = text.replace('async function compileJsToJson(source) {', 'async function compileJsToJson(source, options = {}) {');
text = text.replace('const ast = await parseJs(source);', 'const ast = await parseJs(source, options.file || options.filename || options.path || \'<inline>\');');
text = text.replace('async function compileJsToCode(source) {', 'async function compileJsToCode(source, options = {}) {');
text = text.replace('async function compileJsToSang(source, options = {}) {\n  const ast = await parseJs(source);', 'async function compileJsToSang(source, options = {}) {\n  const ast = await parseJs(source, options.file || options.filename || options.path || \'<inline>\');');
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, preflight: text.includes('assertBasicJsSyntax') }, null, 2));
