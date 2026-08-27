//B"H
const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('geelooy/api/social/helper/comments/commentCreation.js', 'utf8');
assert.match(source, /getHeichelSubmissionSettings/);
assert.match(source, /allowCommentSubmissions === false/);
assert.match(source, /COMMENT_SUBMISSIONS_CLOSED/);
assert.match(source, /requireCommentApproval === false/);
assert.match(source, /submitComment\(\{/);
assert.doesNotMatch(source, /Original logic seemed to prevent submission/);

console.log('B"H commentSubmissionPolicy.test passed');
