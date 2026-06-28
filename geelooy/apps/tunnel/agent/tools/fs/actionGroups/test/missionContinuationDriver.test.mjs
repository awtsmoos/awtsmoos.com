// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Driver = require('../../continuation/runner.js');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'continuation-driver-'));
const config = { root };
function buildActions(_config, payload) { return { stepA: async () => ({ ok: true, action: 'stepA', mustCallNext: { action: 'stepB' } }), stepB: async () => ({ ok: true, action: 'stepB', finalAnswerAllowed: true, mustContinue: false }) }; }
const out = await Driver.run(config, { action: 'missionContinueUntilGate', next: { action: 'stepA' }, maxSteps: 5 }, null, buildActions);
assert.equal(out.ok, true);
assert.equal(out.receipt.reason, 'final_answer_allowed');
assert.deepEqual(out.receipt.trace.map(x => x.action), ['stepA', 'stepB']);
assert.equal(out.finalAnswerAllowed, true);
console.log(JSON.stringify({ ok: true, steps: out.receipt.steps, reason: out.receipt.reason }, null, 2));
