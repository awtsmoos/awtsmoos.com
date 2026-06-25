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
  assert.equal(out.ok, true, `${name} transport ok`);
  assert.equal(out.action, name, `${name} action echo`);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'room-actions-'));
  const config = { root };
  const start = await action(config, 'missionStart', params({ goal: 'multi-agent room actions', minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  const created = await action(config, 'missionRoomCreate', params({ missionId, roomName: 'Shared Boss Room', projectRoot: root }));
  assert.equal(created.roomStatus.counts.agents, 0);
  await action(config, 'missionRoomJoin', params({ missionId, agentId: 'architect', role: 'splitter' }));
  await action(config, 'missionRoomJoin', params({ missionId, agentId: 'tester', role: 'proof' }));
  await action(config, 'missionRoomJoin', params({ missionId, agentId: 'implementer', role: 'code' }));
  const msg = await action(config, 'missionRoomMessage', params({ missionId, agentId: 'architect', message: 'I found the file-map lane.' }));
  assert.equal(msg.roomStatus.counts.messages, 1);
  const discovery = await action(config, 'missionRoomDiscoverAgents', params({ missionId }));
  assert.equal(discovery.discovery.suggestedAgents.length, 3);
  const proposal = await action(config, 'missionRoomProposeSplit', params({ missionId, agentId: 'architect' }));
  assert.equal(proposal.proposal.tasks.length, 3);
  for (const agentId of ['architect', 'tester', 'implementer']) await action(config, 'missionRoomAcceptSplit', params({ missionId, agentId, proposalId: proposal.proposal.id }));
  const sub = await action(config, 'missionRoomCreateSubMissions', params({ missionId, proposalId: proposal.proposal.id, minimumProtocolCycles: 1 }));
  assert.equal(sub.subMissions.length, 3);
  for (const item of sub.subMissions) await action(config, 'missionRoomClaimTask', params({ missionId, agentId: item.agentId, taskId: item.taskId, subMissionId: item.missionId }));
  const status = await action(config, 'missionRoomStatus', params({ missionId }));
  assert.equal(status.roomStatus.counts.agents, 3);
  assert.equal(status.roomStatus.counts.subMissions, 3);
  assert.equal(status.roomStatus.counts.activeClaims, 3);
  const merge = await action(config, 'missionRoomMergeReports', params({ missionId, summary: 'Agents split work and sub-missions exist.' }));
  assert.equal(merge.mergeReport.subMissions.length, 3);
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
