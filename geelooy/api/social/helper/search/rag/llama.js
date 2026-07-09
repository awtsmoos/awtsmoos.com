// B"H
/**
 * @module SocialRagLlama
 * @description The API may summon llama.cpp into the user's external AI root,
 * never into the repo, then ask it for one query embedding.
 */
const fs = require('fs');
const path = require('path');
const child = require('child_process');
const { ragRoot } = require('./paths.js');
const { runnerState, ensureModelDownloaded, embedTextAuto } = require('../../../../../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');
function sh(cmd, opts = {}) { return child.spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8', shell: false, ...opts }); }
function isWin() { return process.platform === 'win32'; }
function commands(root) {
  const lab = path.join(root, 'embedder-lab'), src = path.join(lab, 'llama.cpp'), build = path.join(src, 'build');
  if (isWin()) return [
    `New-Item -ItemType Directory -Force ${JSON.stringify(lab)}`,
    `git clone https://github.com/ggerganov/llama.cpp ${JSON.stringify(src)}`,
    `cmake -S ${JSON.stringify(src)} -B ${JSON.stringify(build)} -DLLAMA_BUILD_TESTS=OFF`,
    `cmake --build ${JSON.stringify(build)} --config Release --target llama-embedding`
  ];
  return [`mkdir -p ${JSON.stringify(lab)}`, `git clone https://github.com/ggerganov/llama.cpp ${JSON.stringify(src)}`, `cmake -S ${JSON.stringify(src)} -B ${JSON.stringify(build)} -DLLAMA_BUILD_TESTS=OFF`, `cmake --build ${JSON.stringify(build)} --target llama-embedding -j2`];
}
function runInstall(root) {
  const cmds = commands(root), shell = isWin() ? 'powershell.exe' : 'bash', flag = isWin() ? '-Command' : '-lc';
  const out = [];
  for (const cmd of cmds) {
    if (cmd.includes('git clone') && fs.existsSync(path.join(root, 'embedder-lab', 'llama.cpp'))) continue;
    const res = sh([shell, flag, cmd], { maxBuffer: 8 * 1024 * 1024 });
    out.push({ cmd, status: res.status, stderr: res.stderr?.slice(-2000), stdout: res.stdout?.slice(-2000) });
    if (res.status) break;
  }
  return out;
}
async function ensureLlama({ $i, autoInstall = true } = {}) {
  const modelRoot = ragRoot($i); fs.mkdirSync(modelRoot, { recursive: true });
  await ensureModelDownloaded({ modelRoot }).catch(() => null);
  let state = runnerState({ modelRoot, embeddingMode: 'llama' });
  let install = null;
  if (!state.llama?.ok && autoInstall) { install = runInstall(modelRoot); state = runnerState({ modelRoot, embeddingMode: 'llama' }); }
  return { ok: Boolean(state.llama?.ok), state, install, installCommands: commands(modelRoot) };
}
async function embedQuery({ $i, query, autoInstall }) {
  const ready = await ensureLlama({ $i, autoInstall });
  const emb = await embedTextAuto(query, { modelRoot: ragRoot($i), embeddingMode: 'llama', noFallback: true, fresh: true });
  return { vector: emb.vector, embedder: { ready, provider: emb.provider, cached: emb.cached } };
}
module.exports = { ensureLlama, embedQuery, commands };
