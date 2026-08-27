// B"H
const assert = require('assert');
const { withDefaultPreviewOff, explicitTrue } = require('../protectedFs.js');
assert.equal(withDefaultPreviewOff({ action:'list' }).autoPreview, false);
assert.equal(withDefaultPreviewOff({ action:'list', autoPreview:true }).autoPreview, true);
assert.equal(withDefaultPreviewOff({ action:'list', autoPreview:false }).autoPreview, false);
assert.equal(explicitTrue(true), true);
assert.equal(explicitTrue('true'), true);
assert.equal(explicitTrue(false), false);
assert.equal(explicitTrue(undefined), false);
console.log('B"H protectedFs defaults autoPreview=false');
