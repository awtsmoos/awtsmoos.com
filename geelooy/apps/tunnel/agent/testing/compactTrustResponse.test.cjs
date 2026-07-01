// B"H
const assert = require('assert');
const ResponseV8 = require('../lib/runtime/response-v8.js');

const out = ResponseV8.compactTrust({
  ok:true,
  action:'commandRun',
  requestAction:'commandRun',
  actualAction:'commandStart',
  summary:'Started test worker.',
  next:'Poll commandJobStatus with jobId cmd_123.',
  trust:'Worker is isolated. Output is streamed. Receipt stored.',
  receipt:{ receiptId:'receipt_1', jobId:'cmd_123', safeToReplay:false },
  worker:{ kind:'subprocess', workerId:'worker_1', state:'running' }
});
assert.deepStrictEqual(Object.keys(out).slice(0, 5), ['ok', 'action', 'summary', 'next', 'trust']);
assert.equal(out.action, 'commandRun');
assert.equal(out.requestAction, 'commandRun');
assert.equal(out.actualAction, 'commandStart');
assert.equal(out.responseProtocol, 'response-v8-compact-trust');
assert.equal(out.receipt.receiptId, 'receipt_1');
assert.equal(out.worker.kind, 'subprocess');
assert.equal(JSON.stringify(out).includes('plainEnglishAllCaps'), false);
assert.equal(JSON.stringify(out).includes('missionOperatingRules'), false);
console.log('compact trust response keeps human surface small and preserves identity');
