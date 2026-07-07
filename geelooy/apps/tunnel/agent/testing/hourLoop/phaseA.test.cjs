// B"H
const assert = require('assert');
const base = '/Users/awtsmoos/.awtsmoos-tunnel/tools/chatgpt/hourLoop';
const Url = require(`${base}/url.js`);
const Emergency = require(`${base}/emergency.js`);
const Handoff = require(`${base}/handoff.js`);
const Prompt = require(`${base}/prompt.js`);
const Metrics = require(`${base}/metrics.js`);
const C = require(`${base}/constants.js`);

const url = Url.normalize({ conversationUrl: 'https://chat.openai.com/c/abc123?x=1#frag' });
assert.equal(url.conversationId, 'abc123');
assert.equal(url.url, 'https://chatgpt.com/c/abc123');
assert(Emergency.check({ authenticated: false }).stop);
assert(Emergency.check({ href: 'about:blank' }).reasons.includes('unexpected_navigation'));
const packet = Handoff.build({ missionId: 'm1', conversationId: 'c1', evidence: Array(20).fill('x'.repeat(300)), touchedFiles: Array(20).fill('/tmp/file'), nextAction: { action: 'x' } });
assert(Buffer.byteLength(JSON.stringify(packet)) <= C.HANDOFF_MAX_BYTES + 200);
const prompt = Prompt.build(packet);
assert(prompt.length <= C.PROMPT_MAX_CHARS);
const metric = Metrics.sample({ routeOk: true, idle: false, tickMs: 12, failure: '' });
assert.equal(metric.routeOk, true);
console.log(JSON.stringify({ ok: true, suite: 'hourLoop phase A', promptChars: prompt.length, packetBytes: Buffer.byteLength(JSON.stringify(packet)) }));
