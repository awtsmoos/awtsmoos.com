// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config, name, payload = {}) { const out = await buildMissionActions({ config, payload: { action: name, ...payload } })[name](); assert.equal(out.ok, true); assert.equal(out.action, name); return out; }
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'room-self-improve-'));
  const rootA = path.join(base, 'git', 'a'); const rootB = path.join(base, 'other', 'b');
  await fs.mkdir(rootA, { recursive: true }); await fs.mkdir(rootB, { recursive: true });
  const meta = path.join(base, '.meta'); const configA = { root: rootA, metadataRoot: meta }; const configB = { root: rootB, metadataRoot: meta };
  const start = await action(configA, 'missionStart', params({ goal: 'room self improve agents', metadata: { projectRoot: rootA }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(configA, 'missionRoomCreate', params({ missionId, projectRoot: rootA, roomName: 'Self Improve Room' }));
  await action(configA, 'missionRoomJoin', params({ missionId, agentId: 'agent_a' }));
  const found = await action(configB, 'missionRoomFindActive', params({ projectRoot: rootA, agentId: 'agent_b' }));
  assert.equal(found.discovery.mustCallNext.missionId, missionId);
  const wake = await action(configA, 'missionRoomWakeAgent', params({ missionId, projectRoot: rootA, agentId: 'agent_b' }));
  assert.equal(wake.wake.agent.agentId, 'agent_b');
  await action(configA, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 2, minimumInnovations: 10, minimumNoveltyScore: 2, minimumMergeCourtPasses: 0 }));
  await action(configA, 'missionRoomSelfImprovePulse', params({ missionId, agentId: 'agent_a', proof: 'agent a proof' }));
  await action(configA, 'missionRoomSelfImprovePulse', params({ missionId, agentId: 'agent_b', proof: 'agent b proof' }));
  const summit = await action(configA, 'missionRoomSummit', params({ missionId }));
  assert.equal(summit.summit.ok, true);
  const trust = await action(configA, 'missionRoomTrustScore', params({ missionId }));
  assert(trust.trust.score > 0);
  console.log(JSON.stringify({ ok: true, missionId, rootA, meta }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
