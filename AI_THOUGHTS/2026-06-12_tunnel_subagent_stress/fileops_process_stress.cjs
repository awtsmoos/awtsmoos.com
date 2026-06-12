// B"H
const { mkdirp, touch, normalizePaths } = require('../../geelooy/apps/tunnel/agent/tools/fs/fileOpsPaths.js');
const { fusePayload, normalizeArgs, normalizePids, buildProcessActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/processActions.js');
const config = { root: process.cwd(), allowWrite: true, allowSecrets: true, tools: { fsWrite: true, fsRead: true, fsList: true } };

async function main() {
  const pathsPayload = { content: JSON.stringify({ paths: ['AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/mkdir_a', 'AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/mkdir_b'] }) };
  const paths = normalizePaths(pathsPayload);
  const mk = await mkdirp(config, pathsPayload);
  const touchResult = await touch(config, { paths: 'AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/touch_a.txt\nAI_THOUGHTS/2026-06-12_tunnel_subagent_stress/touch_b.txt' });
  const fused = fusePayload({ content: JSON.stringify({ args: ['/?'], pids: ['123', '456'] }) });
  const args = normalizeArgs(fused.args);
  const pids = normalizePids(fused);
  const procList = await buildProcessActions({ config, payload: { content: JSON.stringify({ limit: 1 }) } }).processList();
  console.log(JSON.stringify({ paths, mk: { ok: mk.ok, count: mk.count }, touch: { ok: touchResult.ok, count: touchResult.count }, args, pids, procList: { ok: procList.ok, count: procList.count } }, null, 2));
  if (paths.length !== 2 || !mk.ok || mk.count !== 2) process.exit(2);
  if (!touchResult.ok || touchResult.count !== 2) process.exit(3);
  if (args[0] !== '/?' || pids.length !== 2) process.exit(4);
  if (!procList.ok || procList.count !== 1) process.exit(5);
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
