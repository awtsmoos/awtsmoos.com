// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import fss from 'fs';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config, name, payload = {}) { const out = await buildMissionActions({ config, payload: { action: name, ...payload } })[name](); assert.equal(out.ok, true); assert.equal(out.action, name); return out; }
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-awdb-'));
const config = { root, metadataRoot: path.join(root, '.meta') };
const start = await action(config, 'missionStart', { goal: 'awdb primary mission' });
const got = await action(config, 'missionGet', { missionId: start.missionId });
assert.equal(got.mission.id, start.missionId);
assert.equal(fss.existsSync(path.join(config.metadataRoot, '.awtsmoos/missions/awtsmoos-missions.awdb')), true);
assert.equal(fss.existsSync(path.join(root, `.awtsmoos/missions/${start.missionId}/mission.json`)), false);
console.log(JSON.stringify({ ok: true, missionId: start.missionId, backend: 'awtsmoosdb' }, null, 2));
