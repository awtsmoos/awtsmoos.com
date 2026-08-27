// B"H
const assert = require('assert');
const { pruneTunnelResponse, previewExplicit } = require('../responsePruner.js');
const noisy = {
  BH:'B"H', ok:true, action:'commandRun', noise:'remove-me', previewRequired:false,
  previewPolicy:{ enabled:false }, responseFocus:{ previewRequired:true },
  createdPreview:{ id:'a', viewUrl:'https://awtsmoos.com/view/a' }, previewLinks:[{ viewUrl:'https://awtsmoos.com/view/a' }], previewInstruction:'Open it.',
  statusPayload:{ action:'commandStatus', jobId:'j' }, waitPayload:{ action:'commandWait', jobId:'j' }, stdoutPagePayload:{ action:'commandJobOutputPage', jobId:'j', stream:'stdout' },
  controlRequestId:'ctrl', clientRequestId:'client', agentSessionId:'sess', logicalAgentId:'agent', nonce:'nonce'
};
const compact = pruneTunnelResponse(noisy, { action:'commandRun' });
assert.equal(compact.noise, undefined);
assert.equal(compact.createdPreview, undefined);
assert.equal(compact.previewLinks, undefined);
assert.equal(compact.previewInstruction, undefined);
assert.equal(compact.responseFocus.previewRequired, false);
for (const key of ['statusPayload','waitPayload','stdoutPagePayload','agentSessionId','logicalAgentId']) assert.ok(compact[key], key);
assert.equal(previewExplicit({ action:'commandRun' }, noisy), false);
const explicit = pruneTunnelResponse({ ...noisy, previewPolicy:{ enabled:true }, previewRequired:true }, { action:'commandRun', autoPreview:true });
assert.ok(explicit.createdPreview);
assert.ok(explicit.previewLinks);
assert.equal(explicit.responseFocus.previewRequired, true);
console.log('B"H response pruner suppresses preview fields unless explicit');
