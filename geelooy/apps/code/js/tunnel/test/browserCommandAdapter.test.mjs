// B"H
import assert from 'assert';
import { BrowserCommandAdapter } from '../BrowserCommandAdapter.js';

const calls = [];
const fs = {
  async call(payload) {
    calls.push(payload);
    if (payload.action === 'list') return { items: ['README.md', 'src'] };
    if (payload.action === 'read') return { content: 'alpha\nbeta\ngamma\ndelta\n' };
    if (payload.action === 'tree') return { treeText: 'README.md\nsrc/' };
    if (payload.action === 'rg') return { results: [{ path: 'README.md', line: 2, preview: 'beta' }] };
    return { ok: false, error: 'unexpected action' };
  }
};

const adapter = new BrowserCommandAdapter({ fs });
let got = await adapter.run({ command: 'pwd', cwd: '/workspace' });
assert.strictEqual(got.ok, true);
assert.strictEqual(got.action, 'commandRun');
assert.strictEqual(got.stdout, '/workspace');
assert.strictEqual(got.commandMode, 'merkava-virtual');
assert.strictEqual(got.vesselType, 'awtsmoos-code');

got = await adapter.run({ command: 'ls .' });
assert.strictEqual(got.stdout, 'README.md\nsrc');

got = await adapter.run({ command: 'cat README.md' });
assert(got.stdout.includes('alpha'));

got = await adapter.run({ command: 'head README.md 2' });
assert.strictEqual(got.stdout, 'alpha\nbeta');

got = await adapter.run({ command: 'tail README.md 1' });
assert.strictEqual(got.stdout, 'delta');

got = await adapter.run({ command: 'grep beta .' });
assert(got.stdout.includes('README.md:2'));

got = await adapter.run({ command: 'echo hello vessel' });
assert.strictEqual(got.stdout, 'hello vessel');

got = await adapter.run({ command: 'clear' });
assert.strictEqual(got.stdout, '');

got = await adapter.run({ command: 'help' });
assert(got.stdout.includes('Supported browser commands'));
assert(got.stdout.includes('cannot run local shell commands directly'));

got = await adapter.run({ command: 'rm -rf /' });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.action, 'commandRun');
assert.strictEqual(got.exitCode, 1);
assert.strictEqual(got.error, 'browser_command_not_native');
assert.strictEqual(got.commandMode, 'unsupported');
assert(got.stderr.includes('cannot run local shell commands directly'));

console.log('BHY BrowserCommandAdapter tests passed', calls.length);
