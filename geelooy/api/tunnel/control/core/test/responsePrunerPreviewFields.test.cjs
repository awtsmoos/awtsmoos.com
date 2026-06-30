// B"H
const assert = require('assert');
const { pruneTunnelResponse } = require('../responsePruner.js');
const got = pruneTunnelResponse({
  BH: 'B"H', ok: true, action: 'list', noise: 'remove-me',
  previewLinks: [{ viewUrl: 'https://awtsmoos.com/view/a' }],
  previewInstruction: 'Open it.', createdPreview: { id: 'a', viewUrl: 'https://awtsmoos.com/view/a' },
  outputRef: 'awdb://out', resultRef: 'awtsmoos://result', externalized: true,
  contentUrl: 'https://awtsmoos.com/blob/x', handoffUrl: 'https://awtsmoos.com/handoff/x',
  aiInstructions: 'Use resultRef.', mustCallNext: { action: 'x' },
  controlRequestId: 'ctrl', clientRequestId: 'client', agentSessionId: 'sess', logicalAgentId: 'agent', nonce: 'nonce'
});
assert.equal(got.noise, undefined);
for (const key of ['previewLinks','previewInstruction','createdPreview','outputRef','resultRef','externalized','contentUrl','handoffUrl','aiInstructions','mustCallNext','agentSessionId','logicalAgentId']) assert.ok(got[key], key);
console.log('B"H response pruner preserves preview and continuation fields');
