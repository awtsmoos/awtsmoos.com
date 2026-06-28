// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ledger = await import('../../actionLedger.js');
const paths = await import('../../awdb/paths.js');
const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ledger-awdb-'));
const config = { root, tunnelName: 'ledger-test-device' };
const out = await ledger.default.record(config, { action: 'echo', value: 'hi' }, { ok: true, action: 'echo', value: 'hi' });
const report = paths.default.report(config, 'actions');
const rel = path.relative(root, report.dbFile);
assert.equal(fs.existsSync(report.dbFile), true);
assert.equal(rel.startsWith('..') || path.isAbsolute(rel), true);
assert.equal(fs.existsSync(path.join(root, '.awtsmoos/actions/history.jsonl')), false);
assert.equal(report.jsonl, false);
assert.equal(out.replayable, true);
console.log(JSON.stringify({ ok: true, actionId: out.actionId, backend: 'awtsmoosdb', dbFile: report.dbFile, outsideProject: true }, null, 2));
