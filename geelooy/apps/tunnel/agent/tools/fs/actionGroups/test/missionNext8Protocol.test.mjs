// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildActions } = require('../../actions.js');
async function call(config, action, payload = {}) { const out = await buildActions(config, { action, ...payload })[action](); assert.equal(out.ok, true); assert.equal(out.action, action); return out; }
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'next8-'));
const config = { root, tools: { fsRead: true, fsWrite: true }, allowWrite: true };
const start = await call(config, 'missionStart', { goal: 'next 8 loop' });
const missionId = start.missionId;
const plan = await call(config, 'missionNext8Plan', { missionId, steps: ['a','b','c','d','e','f','g','h'] });
assert.equal(plan.next8Steps.length, 8);
assert.equal(plan.mustCallNext.action, 'missionExecuteNext8');
const exec = await call(config, 'missionExecuteNext8', { missionId, stepIndex: 0 });
assert.equal(exec.mustCallNext.action, 'missionReviewNext8Step');
const review = await call(config, 'missionReviewNext8Step', { missionId, stepIndex: 0, evidence: 'done a' });
assert.equal(review.mustCallNext.action, 'missionExecuteNext8');
console.log(JSON.stringify({ ok: true, missionId, next: review.mustCallNext.action }, null, 2));
