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
  assert.equal(out.ok, true, `${name} ok`);
  assert.equal(out.action, name, `${name} action`);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function exists(p) { try { await fs.stat(p); return true; } catch { return false; } }
async function main() {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'central-meta-base-'));
  const projectRoot = path.join(base, 'git', 'project-a');
  await fs.mkdir(projectRoot, { recursive: true });
  const config = { root: projectRoot };
  const start = await action(config, 'missionStart', params({ goal: 'central metadata room', metadata: { projectRoot }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionRoomCreate', params({ missionId, projectRoot, roomName: 'Central Metadata Room' }));
  await action(config, 'missionRoomHeartbeat', params({ missionId, agentId: 'agent_a', status: 'working', currentWork: 'Agent A is writing metadata tests.' }));
  await action(config, 'missionRoomMessage', params({ missionId, agentId: 'agent_b', message: 'Metadata should be centralized outside the project.', currentWork: 'Agent A is writing metadata tests.' }));
  const meta = await action(config, 'missionMetadataStatus', params({ projectRoot }));
  assert.equal(meta.metadata.outsideProject, true);
  assert.equal(meta.metadata.hasJsonFiles, false);
  assert.equal(meta.metadata.dbFile.endsWith('.awdb'), true);
  assert.equal(await exists(meta.metadata.dbFile), true);
  assert.equal(meta.metadata.metadataRoot.startsWith(projectRoot), false);
  assert.equal(meta.metadata.files.some(file => file.endsWith('.json')), false);
  console.log(JSON.stringify({ ok: true, missionId, projectRoot, metadataRoot: meta.metadata.metadataRoot, files: meta.metadata.files }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
