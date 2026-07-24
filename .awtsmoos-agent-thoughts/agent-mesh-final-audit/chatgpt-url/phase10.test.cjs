// B"H
const assert = require('assert');
const os = require('os');
const fs = require('fs');
const path = require('path');
const base = '/Users/awtsmoos/.awtsmoos-tunnel/tools/chatgpt/hourLoop';
const Actions = require(`${base}/actions.js`);
const State = require(`${base}/state.js`);
const Tick = require(`${base}/tick.js`);
const Cycle = require(`${base}/cycle.js`);
const Custom = require(`${base}/customGpt.js`);
const Promote = require(`${base}/promote.js`);

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hour-loop-10-'));
  const url = 'https://chatgpt.com/g/g-abc-custom/c/conv123';
  assert.equal(Custom.parse(url).custom, true);
  assert.equal(Custom.newChatUrl(Custom.parse(url)), 'https://chatgpt.com/g/g-abc-custom');
  assert.equal(Cycle.current(0), 'brainstorm');
  assert.equal(Cycle.current(1), 'plan');
  assert.equal(Cycle.current(2), 'do');
  assert(Cycle.shouldPromote(6, 6));
  const start = Actions.start({ base: tmp, conversationUrl: url, goal: 'stress cycle', promotionEvery: 6 });
  assert.equal(start.ok, true);
  for (let i = 0; i < 6; i++) {
    const result = await Tick.run({ base: tmp, conversationId: 'conv123' }, { readIdle: async () => ({ idle: true, busy: false, promptFound: true }), send: async () => ({ ok: true, submitted: true, via: 'test' }) });
    assert.equal(result.phase, 'submitted');
  }
  const state = State.read(tmp);
  assert.equal(state.sessions.conv123.promptCount, 6);
  const queued = Object.values(state.queue).map(x => x.prompt).join('\n');
  assert(queued.includes('long practical handoff prompt'));
  assert(Promote.prepare({ sourceUrl: url }).target.url.includes('/g/g-abc-custom'));
  console.log(JSON.stringify({ ok: true, suite: 'phase10', promptCount: state.sessions.conv123.promptCount, queued: Object.keys(state.queue).length }));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
