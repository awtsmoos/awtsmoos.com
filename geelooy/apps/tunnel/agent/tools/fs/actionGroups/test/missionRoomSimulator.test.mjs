// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config, name, payload = {}) {
  const actions = buildMissionActions({ config, payload: { action: name, ...payload } });
  const out = await actions[name]();
  assert.equal(out.ok, true);
  assert.equal(out.action, name);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'room-sim-'));
  const config = { root };
  const start = await action(config, 'missionStart', params({ goal: 'multi-agent simulator', minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  const sim = await action(config, 'missionRoomSimulate', params({ missionId, projectRoot: root, minimumProtocolCycles: 1 }));
  assert.equal(sim.simulation.ok, true);
  assert.equal(sim.simulation.agents.length, 3);
  assert.equal(sim.simulation.subMissions.length, 3);
  assert.equal(sim.roomStatus.counts.agents, 3);
  assert.equal(sim.roomStatus.counts.messages, 3);
  assert.equal(sim.roomStatus.counts.subMissions, 3);
  assert.equal(sim.roomStatus.counts.activeClaims, 3);
  for (const item of sim.simulation.subMissions) {
    const child = await action(config, 'missionGet', params({ missionId: item.missionId }));
    assert.equal(child.mission.bossProtocol.enabled, true);
    assert.equal(child.mission.metadata.parentMissionId, missionId);
  }
  console.log(JSON.stringify({ ok: true, missionId, root, subMissions: sim.simulation.subMissions.length }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
