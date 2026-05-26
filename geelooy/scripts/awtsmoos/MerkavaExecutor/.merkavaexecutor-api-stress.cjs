// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

const REQUIRED_SURFACE = [
  'compile', 'compileToBinary', 'compileToBin', 'compileToBinsry',
  'execute', 'executeBinary', 'executeRawJS', 'executeRaw', 'executeRawJSC',
  'executeJSON', 'executeJson', 'executeWeb', 'executeSTD', 'executeStd',
  'magicOf', 'ByteReader', 'ByteWriter', 'createDefaultHost', 'lowerAstToJson',
  'loadMerkavaVm', 'readVarUint', 'writeVarUint', 'runSang', 'runWebBinary',
  'compileJsToSang', 'compileJsonToSang', 'encodeWebBinary', 'decodeWebBinary'
];

(async () => {
  const apiKeys = Object.keys(MerkavaExecutor).sort();
  for (const key of REQUIRED_SURFACE) assert.ok(key in MerkavaExecutor, `Missing public API key: ${key}`);
  assert.strictEqual(MerkavaExecutor.compileToBinsry, MerkavaExecutor.compileToBinary);
  assert.strictEqual(MerkavaExecutor.executeRawJSC, MerkavaExecutor.executeRawJS);

  const js = `let total = seed + 12; __awtsmoosResult = total * 3;`;
  const jsBin = await MerkavaExecutor.compileToBinary(js, { type: 'js' });
  assert.strictEqual(MerkavaExecutor.magicOf(jsBin), 'SANG');
  const jsRun = await MerkavaExecutor.executeBinary(jsBin, { globals: { seed: 2 } });
  assert.strictEqual(jsRun.globals.__awtsmoosResult, 42);

  const jsonProgram = {
    steps: [{ op: 'set', name: 'answer', value: { op: 'mul', args: [{ get: 'x' }, 7] } }],
    result: { get: 'answer' }
  };
  const jsonRun = await MerkavaExecutor.executeJSON(jsonProgram, { globals: { x: 6 } });
  assert.strictEqual(jsonRun.result, 42);

  const webIr = {
    nodes: [{ tag: 'button', id: 'send', text: 'Send' }, { tag: 'div', id: 'chat', text: '' }],
    styles: [{ target: 'chat', props: { color: 'blue' } }],
    events: [{ target: 'send', on: 'click', do: [{ op: 'setText', target: 'chat', value: 'BH' }] }]
  };
  const webBin = await MerkavaExecutor.compileToBinsry(webIr, { type: 'web' });
  assert.strictEqual(MerkavaExecutor.magicOf(webBin), 'MWEB');
  const webRun = await MerkavaExecutor.execute(webBin);
  assert.strictEqual(MerkavaExecutor.triggerWebEvent(webRun, 'send', 'click'), true);
  assert.strictEqual(webRun.document.getElementById('chat').textContent, 'BH');

  const stdRun = await MerkavaExecutor.executeSTD({ stdin: js, type: 'js', globals: { seed: 2 } });
  assert.strictEqual(stdRun.globals.__awtsmoosResult, 42);

  console.log(JSON.stringify({
    ok: true,
    apiKeys: apiKeys.length,
    requiredSurface: REQUIRED_SURFACE,
    js: { magic: MerkavaExecutor.magicOf(jsBin), bytes: jsBin.length, result: jsRun.globals.__awtsmoosResult },
    json: { result: jsonRun.result },
    web: { magic: MerkavaExecutor.magicOf(webBin), bytes: webBin.length, chat: webRun.document.getElementById('chat').textContent },
    std: { result: stdRun.globals.__awtsmoosResult }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
