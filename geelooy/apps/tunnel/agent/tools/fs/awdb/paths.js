// B"H
const path = require('path');
const Device = require('../deviceStateRoot.js');
const DIRS = { missions: 'missions', actions: 'actions', responses: 'actions/large-responses' };
const DBS = { missions: 'awtsmoos-missions.awdb', actions: 'awtsmoos-actions.awdb', responses: 'awtsmoos-large-responses.awdb' };
const MODULE_SUFFIXES = ['ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js', 'ayzarim/dosdb/awtsmoosBinary/awtsmoosdb/index.js'];
function roots(config = {}) {
  return [...new Set([config.repoRoot, config.sourceRoot, config.root, process.cwd(), path.join(__dirname, '../../../../../../')].filter(Boolean).map(x => path.resolve(x)))];
}
function metadataBase(config = {}) {
  return config.metadataRoot ? path.resolve(config.metadataRoot) : Device.awtsmoosRoot(config);
}
function dbDir(config = {}, kind = 'actions') {
  return path.join(metadataBase(config), DIRS[kind] || DIRS.actions);
}
function dbFile(config = {}, kind = 'actions') {
  return path.join(dbDir(config, kind), DBS[kind] || DBS.actions);
}
function report(config = {}, kind = 'actions') {
  return { ...Device.report(config), kind, dbDir: dbDir(config, kind), dbFile: dbFile(config, kind), backend: 'awtsmoosdb', jsonl: false, gitRepoStorage: false };
}
module.exports = { DIRS, DBS, MODULE_SUFFIXES, roots, metadataBase, dbDir, dbFile, report };
