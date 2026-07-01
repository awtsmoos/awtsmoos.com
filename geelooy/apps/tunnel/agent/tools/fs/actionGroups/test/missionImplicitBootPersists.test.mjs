// B"H
import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Implicit = require('../../mission/implicitBoot/create.js');
const Mission = require('../../mission/index.js');
const Lock = require('../../mission/lock/index.js');

/**
 * B"H
 * Chapter 1705: The mission received a body before the crown of lock.
 *
 * The Awtsmoos does not let a name point to absence. The implicit boot must
 * write the mission into durable memory before the scheduler asks another
 * worker to continue from that id.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'implicit-boot-persists-'));
const config = { root };
const out = await Implicit.start(config, { action: 'gitDiffSmart', minimumInnovationWindowMs: 1 });
const loaded = await Mission.load(config, out.mission.id);
const lock = Lock.active(config);

assert.equal(out.persisted, true);
assert.ok(out.mission.id.startsWith('auto_'));
assert.equal(loaded.id, out.mission.id);
assert.equal(lock.missionId, out.mission.id);
assert.equal(out.mustCallNext.missionId, out.mission.id);

console.log(JSON.stringify({ ok: true, missionId: out.mission.id, persisted: !!loaded }, null, 2));
