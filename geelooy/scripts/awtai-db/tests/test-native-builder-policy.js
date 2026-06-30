// B"H
const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');

const builder = path.resolve(__dirname, '../../awtsmoos/compiling/native/rawCAddonBuilder.mjs');
const manifest = path.resolve(__dirname, '../native/build-manifest.json');
const dry = spawnSync(process.execPath, [builder, manifest, '--dry-run'], { encoding: 'utf8' });
assert.strictEqual(dry.status, 0);
assert.strictEqual(JSON.parse(dry.stdout).pureJsCompiler, false);
const blocked = spawnSync(process.execPath, [builder, manifest], { encoding: 'utf8', env: { ...process.env, AWTS_ALLOW_EXTERNAL_CC: '0' } });
assert.notStrictEqual(blocked.status, 0);
assert(String(blocked.stderr).includes('external native compiler forbidden'));
console.log(JSON.stringify({ ok: true, test: 'native-builder-policy' }));
