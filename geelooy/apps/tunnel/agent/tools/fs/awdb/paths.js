// B"H
const path = require('path');
const DIRS = { missions: '.awtsmoos/missions', actions: '.awtsmoos/actions', responses: '.awtsmoos/actions/large-responses' };
const DBS = { missions: 'awtsmoos-missions.awdb', actions: 'awtsmoos-actions.awdb', responses: 'awtsmoos-large-responses.awdb' };
const MODULE_SUFFIXES = ['ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js', 'ayzarim/dosdb/awtsmoosBinary/awtsmoosdb/index.js'];
function roots(config = {}) {
  return [...new Set([config.repoRoot, config.root, process.cwd(), path.join(__dirname, '../../../../../../')].filter(Boolean).map(x => path.resolve(x)))];
}
function dbDir(config, kind) {
  const root = kind === 'missions' && config.metadataRoot ? config.metadataRoot : config.root;
  return path.join(root || process.cwd(), DIRS[kind] || DIRS.actions);
}
function dbFile(config, kind) { return path.join(dbDir(config, kind), DBS[kind] || DBS.actions); }
module.exports = { DIRS, DBS, MODULE_SUFFIXES, roots, dbDir, dbFile };
