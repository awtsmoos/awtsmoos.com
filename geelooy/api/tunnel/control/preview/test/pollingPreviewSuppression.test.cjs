// B"H
const assert = require('assert');
const { autoCreatePreviewResult, pollingShouldStayTiny } = require('../previewAutoCreate.js');
assert.equal(pollingShouldStayTiny({ action: 'commandStatus' }), true);
assert.equal(pollingShouldStayTiny({ action: 'commandJobOutputPage' }), true);
assert.equal(pollingShouldStayTiny({ action: 'commandWait' }), true);
assert.equal(pollingShouldStayTiny({ action: 'commandStatus', autoPreview: true }), false);
const result = { ok: true, action: 'commandStatus', jobId: 'j', status: 'running' };
assert.deepEqual(autoCreatePreviewResult({ userId: 'u' }, { action: 'commandStatus' }, result), result);
console.log('B"H polling actions stay tiny without automatic previews');
