// B"H
const fs = require('fs');
const path = require('path');

/**
 * B"H
 * Chapter 1901: The river kept memory, but swept away the test mud.
 *
 * This module only removes known disposable Awtsmoos state. It preserves
 * command-jobs, actions, translations, and unknown history by default.
 */
const DISPOSABLE_NAMES = new Set(['tmp-install-tests', 'tmp-installed-agent-smoke', 'tmp', '.bundle-downloads']);
const DISPOSABLE_PREFIXES = ['.self-update-', 'self-update-', 'tmp-install-', 'tmp-smoke-'];
const DEFAULT_MAX_BYTES = Number(process.env.AWTSMOOS_STATE_MAX_BYTES || 5 * 1024 * 1024 * 1024);
function exists(p) { try { return fs.existsSync(p); } catch (_) { return false; } }
function stat(p) { try { return fs.statSync(p); } catch (_) { return null; } }
function isDisposableName(name = '') { return DISPOSABLE_NAMES.has(name) || DISPOSABLE_PREFIXES.some(prefix => name.startsWith(prefix)); }
function stateRoots(projectRoot = process.cwd(), installRoot = '') {
  const roots = [];
  if (projectRoot) roots.push(path.join(projectRoot, '.awtsmoos'));
  if (installRoot) roots.push(path.join(installRoot, '.awtsmoos'));
  return [...new Set(roots.map(x => path.resolve(x)))];
}
function entrySize(p) {
  const s = stat(p);
  if (!s) return 0;
  if (s.isFile()) return s.size;
  if (!s.isDirectory()) return 0;
  let total = 0;
  for (const name of safeReaddir(p)) total += entrySize(path.join(p, name));
  return total;
}
function safeReaddir(p) { try { return fs.readdirSync(p); } catch (_) { return []; } }
function disposableEntries(root) {
  return safeReaddir(root).filter(isDisposableName).map(name => {
    const full = path.join(root, name), s = stat(full) || {};
    return { name, path:full, mtimeMs:Number(s.mtimeMs || 0), bytes:entrySize(full) };
  }).sort((a, b) => a.mtimeMs - b.mtimeMs);
}
function removeEntry(item, dryRun = false) {
  if (!item || !item.path) return false;
  if (!dryRun) fs.rmSync(item.path, { recursive:true, force:true });
  return true;
}
function cleanupRoot(root, options = {}) {
  const dryRun = options.dryRun === true;
  const maxBytes = Number(options.maxBytes || DEFAULT_MAX_BYTES);
  const result = { root, exists:exists(root), removed:[], kept:[], beforeBytes:0, afterBytes:0, dryRun };
  if (!result.exists) return result;
  const entries = disposableEntries(root);
  result.beforeBytes = entrySize(root);
  for (const item of entries) {
    if (item.bytes <= 0 || isDisposableName(item.name)) {
      removeEntry(item, dryRun);
      result.removed.push(item);
    }
  }
  result.afterBytes = dryRun ? result.beforeBytes : entrySize(root);
  if (result.afterBytes > maxBytes) {
    for (const item of disposableEntries(root)) {
      if (result.afterBytes <= maxBytes) break;
      removeEntry(item, dryRun);
      result.removed.push(item);
      result.afterBytes = dryRun ? result.afterBytes - item.bytes : entrySize(root);
    }
  }
  const removed = new Set(result.removed.map(x => x.name));
  result.kept = safeReaddir(root).filter(name => !removed.has(name));
  return result;
}
function cleanupAwtsmoosState(options = {}) {
  const roots = options.roots || stateRoots(options.projectRoot, options.installRoot);
  return roots.map(root => cleanupRoot(root, options));
}
module.exports = { DISPOSABLE_NAMES, DISPOSABLE_PREFIXES, DEFAULT_MAX_BYTES, cleanupAwtsmoosState, cleanupRoot, disposableEntries, entrySize, isDisposableName, stateRoots };
