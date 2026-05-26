// B"H
import assert from 'assert';
import path from 'path';
import { simulateMerkavaRuntime } from './merkava-service/merkava/merkavaRuntime.js';

const projectRoot = path.resolve('../../../../');
const aiIndex = path.join(projectRoot, 'geelooy/ai/index.html');

const run = await simulateMerkavaRuntime({
  runtime: 'browser',
  entry: aiIndex,
  returnValues: ['window.__awtsmoosServerReady']
});

assert.strictEqual(run.errors.length, 0, JSON.stringify(run.errors, null, 2));
assert.strictEqual(run.ok, true, JSON.stringify({ errors: run.errors, input: run.input }, null, 2));
assert(run.input.files.some(file => /(?:^|\/)index\.html$/.test(file)), 'collected runtime must include index.html');
assert(run.input.files.some(file => /index\.js$/.test(file)), 'collected runtime must include index.js');
console.log(JSON.stringify({ ok: run.ok, entry: run.entry, files: run.input.files.length, errors: run.errors.length, score: run.score }, null, 2));
