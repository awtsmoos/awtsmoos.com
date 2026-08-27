// B"H
const fs = require('fs');
const path = require('path');
const C = require('./constants.js');
const S = require('./state.js');
function root(base = process.env.HOME || process.cwd()) { return path.join(base, '.awtsmoos-tunnel', 'device-state', C.STATE_DIR); }
function file(base) { return path.join(root(base), 'tasks.json'); }
function read(base) { try { return S.normalize(JSON.parse(fs.readFileSync(file(base), 'utf8'))); } catch { return S.empty(); } }
function write(base, state) { fs.mkdirSync(root(base), { recursive:true }); const next = S.trim(S.normalize(state)); next.updatedAt = new Date().toISOString(); fs.writeFileSync(file(base), JSON.stringify(next, null, 2)); return next; }
function patch(base, fn) { const state = read(base); return write(base, fn(state) || state); }
module.exports = { root, file, read, write, patch };
