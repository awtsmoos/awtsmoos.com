// B"H
const assert = require('assert');
const { compileExpression } = require('./merkava-binary/SangExpressionCompiler.js');
const { compileWebGraph, createWebHost } = require('./merkava-binary/SangWebCompiler.js');
const { compileStrictJs } = require('./merkava-binary/SangStrictJsCompiler.js');
const { runSang } = require('./merkava-binary/SangVmRunner.js');

function fakeDocument() {
  const body = { children: [], appendChild(el) { this.children.push(el); } };
  return { body, createElement(tag) { return { tagName: tag.toUpperCase(), style: {}, textContent: '', id: '' }; } };
}

const mathBin = compileExpression('(a + 7) * 3 - b / 2');
const math = runSang(mathBin, { globals: { a: 5, b: 8 } });
assert.strictEqual(math.ok, true);
assert.strictEqual(math.result, 32);

const strictBin = compileStrictJs('__awtsmoosResult = x * 9 + 1');
const strict = runSang(strictBin, { globals: { x: 6 } });
assert.strictEqual(strict.ok, true);
assert.strictEqual(strict.result, 55);
assert.strictEqual(strict.globals.__awtsmoosResult, 55);

const documentLike = fakeDocument();
const webHost = createWebHost(documentLike);
const webBin = compileWebGraph({
  nodes: [
    { tag: 'main', id: 'root', text: 'BH SANG', style: { display: 'grid' } },
    { tag: 'button', id: 'gate', text: 'Open', style: { color: 'gold' } }
  ],
  resultExpression: 'document.body.children.length'
});
const web = runSang(webBin, { hostAPI: webHost.hostAPI });
assert.strictEqual(web.ok, true);
assert.strictEqual(documentLike.body.children.length, 2);
assert.strictEqual(documentLike.body.children[1].id, 'gate');
assert.strictEqual(webHost.journal.length, 3);

console.log(JSON.stringify({
  ok: true,
  math: { result: math.result, binaryBytes: mathBin.length, constants: math.artifact.constants.length },
  strictJs: { result: strict.result, stored: strict.globals.__awtsmoosResult, binaryBytes: strictBin.length },
  web: { nodes: documentLike.body.children.length, journal: webHost.journal, binaryBytes: webBin.length }
}, null, 2));
