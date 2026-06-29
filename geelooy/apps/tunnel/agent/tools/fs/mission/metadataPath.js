// B"H
const fs = require('fs');
const path = require('path');
const os = require('os');

function home(config = {}, input = {}) {
  if (input.metadataRoot || config.metadataRoot) return path.resolve(input.metadataRoot || config.metadataRoot);
  if (process.env.AWTSMOOS_TUNNEL_META_ROOT) return path.resolve(process.env.AWTSMOOS_TUNNEL_META_ROOT);
  const androidDocs = '/storage/emulated/0/Documents';
  if (fs.existsSync(androidDocs)) return path.join(androidDocs, '.awtsmoos', 'tunnel-meta');
  const homeDocs = path.join(os.homedir(), 'Documents');
  if (fs.existsSync(homeDocs)) return path.join(homeDocs, '.awtsmoos', 'tunnel-meta');
  return path.join(os.homedir(), '.awtsmoos', 'tunnel-meta');
}
function dbFile(config = {}, input = {}) { return path.join(home(config, input), 'awtsmoos-tunnel.awdb'); }
function fallbackFile(config = {}, input = {}) { return path.join(home(config, input), 'awtsmoos-tunnel.records.awtsmoos'); }
function isInside(child, parent) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}
function report(config = {}, input = {}) {
  const root = path.resolve(input.projectRoot || config.root || process.cwd());
  const metadataRoot = home(config, input);
  return { projectRoot: root, metadataRoot, dbFile: dbFile(config, input), fallbackFile: fallbackFile(config, input), outsideProject: !isInside(metadataRoot, root), globalMetadataRoot: true, format: 'awtsmoosdb-or-awtsmoos-lines', jsonFiles: false };
}

/**
 * B"H
 * The store is now a fixed chamber of the device, not a shadow thrown by the
 * current repo. Wherever the tunnel starts, the same metadata palace answers.
 */
module.exports = { home, dbFile, fallbackFile, isInside, report };
