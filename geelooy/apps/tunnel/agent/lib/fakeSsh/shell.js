// B"H
const path = require('path');
function mounts(config = {}) { return [{ name:'tunnels', path:'/tunnels/local', real:config.root || process.cwd() }, { name:'previews', path:'/previews', real:'.awtsmoos/shares' }, { name:'receipts', path:'/receipts', real:'.awtsmoos' }]; }
function resolve(config, cwd = '/', target = '') { const full = path.posix.resolve(cwd || '/', target || '.'); const mount = mounts(config).find(m => full === m.path || full.startsWith(m.path + '/')); if (!mount) return { virtual:full, real:null, error:'unknown_virtual_mount' }; const rest = path.posix.relative(mount.path, full); return { virtual:full, real:path.join(mount.real, rest), mount:mount.name }; }
function help() { return ['pwd','ls','cat <file>','cd <dir>','mounts','preview <path>','jobs'].join('\n'); }
function prompt(cwd = '/') { return `awtsmoos:${cwd}$`; }
module.exports = { mounts, resolve, help, prompt };
