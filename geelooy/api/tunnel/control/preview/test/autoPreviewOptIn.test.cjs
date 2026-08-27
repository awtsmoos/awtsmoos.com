// B"H
const assert = require('assert');
const { canAutoPreview, DEFAULT_SETTINGS } = require('../previewPolicy.js');
for (const action of ['list','tree','read','md','commandRun','commandStart']) assert.equal(canAutoPreview(action, DEFAULT_SETTINGS, {}), false, action);
for (const action of ['list','read','commandRun']) assert.equal(canAutoPreview(action, DEFAULT_SETTINGS, { autoPreview:true }), true, action);
console.log('B"H auto preview is opt-in for all actions');
