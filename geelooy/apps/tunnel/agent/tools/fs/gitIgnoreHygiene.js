// B"H
const fsp = require('fs/promises');
const { safePath } = require('./pathGuard.js');
const HEADER = '# B"H Awtsmoos generated artifacts';
const TEMP_PATTERNS = ['.awtsmoos/','.awtsmoos/actions/','.awtsmoos/actions/results/','.awtsmoos/previews/','.awtsmoos/tmp/','.Awtsmoos/','.Awtsmoos/actions/','.Awtsmoos/actions/results/','.Awtsmoos/previews/','.Awtsmoos/tmp/','**/.awtsmoos/','**/.Awtsmoos/','.awtsmoos-tmp/','.Awtsmoos-tmp/','*.awtsmoos.log','.awtsmoos.local.json','.Awtsmoos.local.json'];
const AI_THOUGHTS_PATTERNS = ['ai_thoughts/','AI_THOUGHTS/','ai-thoughts/','AI-THOUGHTS/','**/ai_thoughts/','**/AI_THOUGHTS/','**/ai-thoughts/','**/AI-THOUGHTS/'];
const GENERATED_PATTERNS = ['**/runtime-cache/','**/execution-plans/*.json','**/tests/headless/visual-proof/*.png','**/tests/chrome/*.png','**/tests/chrome/*.json','**/reports/*.json','**/dist/*.exe','**/.cache/','**/tmp/','**/temp/'];
/**
 * B"H — generated thought rivers stay outside git by default.
 * This hygiene block prevents another 45G planning/archive bloom from being
 * staged just because an agent wrote useful but disposable evidence.
 */
function gitHygieneConfig(config = {}) {
  const got = config.gitHygiene || {};
  return { autoUpdateGitignore:got.autoUpdateGitignore !== false, ignoreAwtsmoosTemp:got.ignoreAwtsmoosTemp !== false, ignoreAiThoughts:got.ignoreAiThoughts !== false, ignoreGenerated:got.ignoreGenerated !== false, managedHeader:got.managedHeader || HEADER };
}
async function isGitRepo(config = {}) { try { const s = await fsp.stat(safePath(config, '.git')); return s.isDirectory() || s.isFile(); } catch { return false; } }
async function ensureGitignoreHygiene(config = {}, reason = 'awtsmoos-write') {
  const h = gitHygieneConfig(config); if (!h.autoUpdateGitignore) return { ok:true, changed:false, skipped:true, reason:'disabled' };
  if (!(await isGitRepo(config))) return { ok:true, changed:false, skipped:true, reason:'not_git_repo' };
  const wanted = wantedPatterns(h), gitignorePath = safePath(config, '.gitignore'), before = await readText(gitignorePath), after = mergeManagedBlock(before, h.managedHeader, wanted);
  if (after === before) return { ok:true, changed:false, path:'.gitignore', reason };
  await fsp.writeFile(gitignorePath, after, 'utf8'); return { ok:true, changed:true, path:'.gitignore', reason, patterns:wanted };
}
function wantedPatterns(h) { return [...(h.ignoreAwtsmoosTemp ? TEMP_PATTERNS : []), ...(h.ignoreAiThoughts ? AI_THOUGHTS_PATTERNS : []), ...(h.ignoreGenerated ? GENERATED_PATTERNS : [])]; }
async function readText(file) { try { return await fsp.readFile(file, 'utf8'); } catch { return ''; } }
function mergeManagedBlock(before = '', header = HEADER, wanted = []) {
  const normalized = String(before || '').replace(/\r\n/g, '\n'), lines = normalized.split('\n'), existing = new Set(lines.map(x => x.trim()).filter(Boolean));
  const blockLines = [header, ...wanted.filter(x => !existing.has(x))].filter((line, i, arr) => arr.indexOf(line) === i);
  if (blockLines.length === 1 && normalized.includes(header)) return before;
  const base = removeManagedBlock(lines, header).join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/g, '');
  return `${base ? base + '\n\n' : ''}${[header, ...wanted].join('\n')}\n`;
}
function removeManagedBlock(lines, header) { const out = []; for (let i = 0; i < lines.length; i++) { if (lines[i].trim() !== header.trim()) { out.push(lines[i]); continue; } while (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].startsWith('# ')) i++; } return out; }
module.exports = { AI_THOUGHTS_PATTERNS, GENERATED_PATTERNS, HEADER, TEMP_PATTERNS, ensureGitignoreHygiene, gitHygieneConfig, isGitRepo, mergeManagedBlock, wantedPatterns };
