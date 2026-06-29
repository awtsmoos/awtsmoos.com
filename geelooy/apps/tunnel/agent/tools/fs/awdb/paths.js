// B"H
const path = require('path');
const Device = require('../deviceStateRoot.js');
const DIRS = { missions: 'missions', actions: 'actions', responses: 'actions/large-responses' };
const DBS = { missions: 'awtsmoos-missions.awdb', actions: 'awtsmoos-actions.awdb', responses: 'awtsmoos-large-responses.awdb' };
const MODULE_SUFFIXES = ['ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js', 'ayzarim/dosdb/awtsmoosBinary/awtsmoosdb/index.js'];
function ancestors(start) {
  const out = [];
  let dir = path.resolve(start || process.cwd());
  while (dir && !out.includes(dir)) { out.push(dir); const next = path.dirname(dir); if (next === dir) break; dir = next; }
  return out;
}
function roots(config = {}) {
  const seeds = [config.repoRoot, config.sourceRoot, config.root, process.cwd(), __dirname].filter(Boolean);
  const all = [];
  for (const seed of seeds) all.push(...ancestors(seed));
  return [...new Set(all)];
}
function metadataBase(config = {}) { return config.metadataRoot ? path.resolve(config.metadataRoot) : Device.awtsmoosRoot(config); }
function dbDir(config = {}, kind = 'actions') { return path.join(metadataBase(config), DIRS[kind] || DIRS.actions); }
function dbFile(config = {}, kind = 'actions') { return path.join(dbDir(config, kind), DBS[kind] || DBS.actions); }
function report(config = {}, kind = 'actions') { return { ...Device.report(config), kind, dbDir: dbDir(config, kind), dbFile: dbFile(config, kind), backend: 'awtsmoosdb', jsonl: false, gitRepoStorage: false }; }
module.exports = { DIRS, DBS, MODULE_SUFFIXES, ancestors, roots, metadataBase, dbDir, dbFile, report };
