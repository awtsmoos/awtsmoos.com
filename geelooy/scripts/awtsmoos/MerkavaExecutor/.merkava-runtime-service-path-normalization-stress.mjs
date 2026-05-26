// B"H
import assert from 'assert';
import { simulateMerkavaRuntime } from './merkava-service/merkava/merkavaRuntime.js';

const files = {
  'app/runtime/entry.js': `import { answer } from '../shared/answer.js'; window.__awtsmoosResult = answer + 1; export const result = answer + 1;`,
  'app/shared/answer.js': `export const answer = 41;`
};

const run = await simulateMerkavaRuntime({
  runtime: 'browser',
  files,
  entry: 'app/runtime/entry.js',
  returnValues: ['window.__awtsmoosResult']
});

assert.strictEqual(run.ok, true, JSON.stringify(run.errors, null, 2));
assert.deepStrictEqual(run.errors, []);
assert.strictEqual(run.values['window.__awtsmoosResult'], 42);
console.log(JSON.stringify({ ok: true, value: run.values['window.__awtsmoosResult'], errors: run.errors }, null, 2));
