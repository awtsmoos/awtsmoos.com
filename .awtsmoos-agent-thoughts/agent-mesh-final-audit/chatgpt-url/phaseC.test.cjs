// B"H
const assert = require('assert');
const os = require('os');
const fs = require('fs');
const path = require('path');
const base = '/Users/awtsmoos/.awtsmoos-tunnel/tools/chatgpt/hourLoop';
const State = require(`${base}/state.js`);
const Queue = require(`${base}/queue.js`);
const Tick = require(`${base}/tick.js`);

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hour-loop-c-'));
  let state = State.empty();
  state.current = 'c1';
  Queue.add(state, Queue.create({ conversationId: 'c1', prompt: 'continue' }));
  State.write(tmp, state);
  const waiting = await Tick.run({ base: tmp, conversationId: 'c1', owner: 'a' }, { readIdle: async () => ({ idle: false, busy: true, promptFound: true }) });
  assert.equal(waiting.phase, 'waiting_response');
  const sent = await Tick.run({ base: tmp, conversationId: 'c1', owner: 'b' }, { readIdle: async () => ({ idle: true, busy: false, promptFound: true }), send: async () => ({ ok: true, submitted: true, via: 'test' }) });
  assert.equal(sent.phase, 'submitted');
  const loaded = State.read(tmp);
  assert.equal(Object.values(loaded.queue)[0].state, 'waiting_response');
  assert(loaded.receipts.length >= 2);
  console.log(JSON.stringify({ ok: true, suite: 'hourLoop phase C', phase: sent.phase, receipts: loaded.receipts.length }));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
