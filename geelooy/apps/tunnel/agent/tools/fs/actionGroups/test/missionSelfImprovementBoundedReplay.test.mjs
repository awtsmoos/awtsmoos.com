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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'self-improve-bounded-'));
  const meta = path.join(root, '.meta'); const config = { root, metadataRoot: meta };
  const start = await action(config, 'missionStart', params({ goal: 'bounded replay handoff', metadata: { projectRoot: root }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionRoomCreate', params({ missionId, projectRoot: root, roomName: 'Replay Room' }));
  await action(config, 'missionRoomJoin', params({ missionId, agentId: 'agent_a' }));
  await action(config, 'missionRoomClaimFile', params({ missionId, agentId: 'agent_a', file: 'alpha.js', purpose: 'bounded proof' }));
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 3, minimumInnovations: 15, minimumNoveltyScore: 3, minimumMergeCourtPasses: 0, summitEveryCycles: 2 }));
  const run = await action(config, 'missionSelfImproveRunBounded', params({ missionId, maxPulses: 3, proof: 'bounded proof', file: 'alpha.js', test: 'node alpha.test.js' }));
  assert.equal(run.run.pulses, 3);
  assert.equal(run.run.court.ok, true);
  const replay = await action(config, 'missionRoomReplay', params({ missionId, limit: 100 }));
  assert(replay.replay.count >= 3);
  assert(replay.replay.sources.self_improve_receipt >= 3);
  const handoff = await action(config, 'missionRoomHandoffPack', params({ missionId }));
  assert.equal(handoff.handoff.agents.includes('agent_a'), true);
  assert.equal(handoff.handoff.activeClaims.length, 1);
  assert.equal(handoff.handoff.finalAnswerAllowed, false);
  const status = await action(config, 'missionMetadataStatus', params({ metadataRoot: meta }));
  assert.equal(status.metadata.hasJsonFiles, true);
  assert(status.metadata.files.some(f => f.endsWith('.jsonl')));
  console.log(JSON.stringify({ ok: true, missionId, meta, replayCount: replay.replay.count }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
