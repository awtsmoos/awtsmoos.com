// B"H
const assert = require('assert');
const os = require('os');
const fs = require('fs');
const path = require('path');
const base = '/Users/awtsmoos/.awtsmoos-tunnel/tools/chatgpt/hourLoop';
const State = require(`${base}/state.js`);
const Queue = require(`${base}/queue.js`);
const Locks = require(`${base}/locks.js`);
const Receipts = require(`${base}/receipts.js`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hour-loop-'));
let state = State.empty();
const item = Queue.create({ conversationId: 'c1', prompt: 'go' });
Queue.add(state, item);
assert.equal(Queue.next(state, 'c1').id, item.id);
state.queue[item.id] = Queue.transition(item, 'waiting_idle');
assert.equal(Queue.pending(state, 'c1').length, 1);
assert(Locks.acquire(state, 'c1', 'a').ok);
assert.equal(Locks.acquire(state, 'c1', 'b').ok, false);
assert(Locks.release(state, 'c1', 'a').ok);
const receipt = Receipts.create({ conversationId: 'c1', ok: true, evidence: ['passed'] });
Receipts.add(state, receipt);
State.write(tmp, state);
const loaded = State.read(tmp);
assert.equal(Queue.next(loaded, 'c1').id, item.id);
assert.equal(Receipts.recent(loaded, 'c1', 1)[0].id, receipt.id);
console.log(JSON.stringify({ ok: true, suite: 'hourLoop phase B', queue: Object.keys(loaded.queue).length, receipts: loaded.receipts.length }));
