// B"H
const assert = require('assert');
const { executeVmFiles, resolveSpecifier, moduleAliases } = require('./merkava-binary/MerkavaVmFileExecutor.js');

(async () => {
  assert.strictEqual(
    resolveSpecifier('../workerClient.js', '/geelooy/ai/js/render/runtime/eventPayloadVault.js'),
    '/geelooy/ai/js/render/workerClient.js'
  );
  assert(moduleAliases('/geelooy/ai/js/render/runtime/../workerClient.js').includes('/geelooy/ai/js/render/workerClient.js'));

  const files = {
    'app/runtime/entry.js': `import { answer } from '../shared/answer.js'; export const result = answer + 1;`,
    'app/shared/answer.js': `export const answer = 41;`
  };
  const run = await executeVmFiles({ files, entry: '/app/runtime/entry.js', runtime: 'browser' });
  assert.strictEqual(run.ok, true);
  assert.strictEqual(run.exports.result, 42);
  assert(run.modules['/app/runtime/entry.js'] || run.modules['app/runtime/entry.js']);
  console.log(JSON.stringify({ ok: true, result: run.exports.result, modules: Object.keys(run.modules).sort() }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
