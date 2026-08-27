// B"H
const assert = require('assert');
const { autoCreatePreviewResult, pollingShouldStayTiny, shouldStayTiny } = require('../previewAutoCreate.js');
const { canAutoPreview, DEFAULT_SETTINGS } = require('../previewPolicy.js');
assert.equal(pollingShouldStayTiny({ action: 'commandStatus' }), true);
assert.equal(pollingShouldStayTiny({ action: 'commandJobOutputPage' }), true);
assert.equal(pollingShouldStayTiny({ action: 'commandWait' }), true);
assert.equal(pollingShouldStayTiny({ action: 'commandStatus', autoPreview: true }), false);
assert.equal(shouldStayTiny({ action:'commandRun' }, { ok:true, previewPolicy:{ enabled:false } }), true);
assert.equal(shouldStayTiny({ action:'commandRun' }, { ok:true, previewRequired:false }), true);
assert.equal(shouldStayTiny({ action:'commandRun' }, { ok:true, responseFocus:{ previewRequired:false } }), true);
assert.equal(shouldStayTiny({ action:'commandRun' }, { ok:true }), true);
assert.equal(shouldStayTiny({ action:'commandRun', autoPreview:true }, { ok:true }), false);
assert.equal(canAutoPreview('commandRun', DEFAULT_SETTINGS, {}), false);
assert.equal(canAutoPreview('commandRun', DEFAULT_SETTINGS, { autoPreview:true }), true);
const result = { ok: true, action: 'commandStatus', jobId: 'j', status: 'running' };
assert.deepEqual(autoCreatePreviewResult({ userId: 'u' }, { action: 'commandStatus' }, result), result);
console.log('B"H command and polling actions stay tiny unless autoPreview=true');
