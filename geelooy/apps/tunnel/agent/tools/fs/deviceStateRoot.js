// B"H
const crypto = require('crypto');
const os = require('os');
const path = require('path');
function clean(value, fallback = 'device') {
  const text = String(value || fallback).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return text || fallback;
}
function hash(value = '') { return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 12); }
function deviceKey(config = {}) {
  const name = config.tunnelName || process.env.AWTSMOOS_TUNNEL_NAME || os.hostname() || 'device';
  const rootHash = hash(config.root || process.cwd());
  return `${clean(name)}-${rootHash}`;
}
function baseRoot(config = {}) {
  if (config.deviceStateRoot) return path.resolve(config.deviceStateRoot);
  if (process.env.AWTSMOOS_TUNNEL_STATE_ROOT) return path.resolve(process.env.AWTSMOOS_TUNNEL_STATE_ROOT);
  return path.join(os.homedir(), '.awtsmoos-tunnel', 'device-state');
}
function root(config = {}) { return path.join(baseRoot(config), deviceKey(config)); }
function awtsmoosRoot(config = {}) { return path.join(root(config), '.Awtsmoos'); }
function report(config = {}) {
  const projectRoot = path.resolve(config.root || process.cwd());
  const stateRoot = root(config);
  const rel = path.relative(projectRoot, stateRoot);
  return { projectRoot, stateRoot, awtsmoosRoot: awtsmoosRoot(config), deviceKey: deviceKey(config), outsideProject: rel.startsWith('..') || path.isAbsolute(rel) };
}
module.exports = { clean, deviceKey, baseRoot, root, awtsmoosRoot, report };
