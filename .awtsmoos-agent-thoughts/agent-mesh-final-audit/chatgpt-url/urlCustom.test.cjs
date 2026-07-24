// B"H
const assert = require('assert');
const Url = require('/Users/awtsmoos/.awtsmoos-tunnel/tools/chatgpt/hourLoop/url.js');
const custom = 'https://chatgpt.com/g/g-abc/c/conv-123?x=1#frag';
assert.equal(Url.idFromUrl(custom), 'conv-123');
assert.equal(Url.normalize({ conversationUrl: custom }).conversationId, 'conv-123');
assert.equal(Url.normalize({ conversationUrl: custom }).url, 'https://chatgpt.com/g/g-abc/c/conv-123');
console.log(JSON.stringify({ ok:true, suite:'hourLoop custom url parse' }));
