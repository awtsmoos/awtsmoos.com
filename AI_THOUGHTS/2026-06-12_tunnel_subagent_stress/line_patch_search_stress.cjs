// B"H
const fs = require('fs/promises');
const path = require('path');
const { readManyLines } = require('../../geelooy/apps/tunnel/agent/tools/fs/lineBatch.js');
const { applyPatch, grep } = require('../../geelooy/apps/tunnel/agent/tools/fs/searchEdit.js');
const config = { root: process.cwd(), allowWrite: true, allowSecrets: true, tools: { fsRead: true, fsWrite: true, fsList: true } };

async function main() {
  const target = 'AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/patch_target.txt';
  await fs.writeFile(path.join(process.cwd(), target), 'alpha\nbeta\ngamma\n', 'utf8');
  const ranges = [{ path: 'geelooy/apps/tunnel/agent/tools/fs/actionBatch.js', startLine: 1, endLine: 2 }];
  const lines = await readManyLines(config, { content: JSON.stringify({ ranges }) });
  const patch = await applyPatch(config, { content: JSON.stringify({ path: target, edits: [{ find: 'beta', replace: 'BETA' }] }) });
  const grepDeadline = await grep(config, { p: 'geelooy/apps/tunnel/agent/tools/fs', query: 'function', maxFiles: 500, maxResults: 500, deadlineMs: 1 });
  console.log(JSON.stringify({
    lines: { ok: lines.ok, count: lines.count, firstLines: lines.results && lines.results[0] && lines.results[0].returnedLines },
    patch: { ok: patch.ok, changed: patch.changed, editCount: patch.editCount },
    grepDeadline: { ok: grepDeadline.ok, timedOut: grepDeadline.timedOut, partial: grepDeadline.partial, returnedResults: grepDeadline.returnedResults }
  }, null, 2));
  if (!lines.ok || lines.count !== 1) process.exit(2);
  if (!patch.ok || !patch.changed) process.exit(3);
  if (!grepDeadline.ok || !grepDeadline.partial) process.exit(4);
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
