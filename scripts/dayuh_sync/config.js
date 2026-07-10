// B"H
const fs = require('fs');
const path = require('path');
const DEFAULT_EXCLUDES = [
  '.DS_Store', '*.lock', '*.wal', '*.wal-shm', '*.wal-shm.lock',
  '*.readers/**', '.awtsmoos-dayuh-sync-manifest.json'
];
function loadConfig(file) {
  const absolute = path.resolve(file || process.env.AWTSMOOS_DAYUH_SYNC_CONFIG || 'dayuh-sync.json');
  const raw = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  const localRoot = path.resolve(raw.localRoot || '../../dayuhChadash');
  if (!raw.remoteRoot) throw new Error('remoteRoot is required.');
  const auth = raw.auth || {};
  return {
    file:absolute,
    localRoot,
    remoteRoot:String(raw.remoteRoot).replace(/\/+$/g,''),
    host:raw.host || process.env.AWTSMOOS_SYNC_HOST,
    port:Number(raw.port || process.env.AWTSMOOS_SYNC_PORT || 22),
    username:raw.username || process.env.AWTSMOOS_SYNC_USER,
    password:process.env.AWTSMOOS_SYNC_PASSWORD || auth.password || '',
    privateKey:process.env.AWTSMOOS_SYNC_PRIVATE_KEY || auth.privateKey || '',
    passphrase:process.env.AWTSMOOS_SYNC_PASSPHRASE || auth.passphrase || '',
    excludes:[...DEFAULT_EXCLUDES,...(Array.isArray(raw.excludes)?raw.excludes:[])],
    chunkBytes:Number(raw.chunkBytes || 1024*1024),
    deleteExtraneous:Boolean(raw.deleteExtraneous)
  };
}
function connection(config) {
  if (!config.host || !config.username) throw new Error('host and username are required.');
  if (!config.password && !config.privateKey) throw new Error('Set AWTSMOOS_SYNC_PASSWORD or AWTSMOOS_SYNC_PRIVATE_KEY.');
  return { host:config.host, port:config.port, username:config.username, password:config.password || undefined, privateKey:config.privateKey ? (config.passphrase ? {key:config.privateKey,passphrase:config.passphrase}:config.privateKey) : undefined };
}
module.exports = { loadConfig, connection, DEFAULT_EXCLUDES };
