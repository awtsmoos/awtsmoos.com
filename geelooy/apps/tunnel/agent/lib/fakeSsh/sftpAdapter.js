// B"H
const fsp = require('fs/promises');
const path = require('path');
const Shell = require('./shell.js');
function local(config, cwd, target) { const r = Shell.resolve(config, cwd || '/', target || '.'); if (r.error) throw new Error(r.error); const root = path.resolve(config.root); const full = path.resolve(root, r.real); if (!full.startsWith(root)) throw new Error('path_escape'); return { ...r, full, relative:path.relative(root, full).replace(/\\/g, '/') || '.' }; }
async function readdir(config, cwd, target) { const p = local(config, cwd, target); const xs = await fsp.readdir(p.full, { withFileTypes:true }); return xs.map(x => ({ filename:x.name, longname:x.name + (x.isDirectory() ? '/' : ''), attrs:{ isDirectory:x.isDirectory(), isFile:x.isFile() } })); }
async function stat(config, cwd, target) { const s = await fsp.stat(local(config, cwd, target).full); return { size:s.size, mtime:s.mtimeMs, isDirectory:s.isDirectory(), isFile:s.isFile() }; }
async function readFile(config, cwd, target, encoding = null) { const p = local(config, cwd, target); return { path:p.relative, content:await fsp.readFile(p.full, encoding || null) }; }
async function writeFile(config, cwd, target, content) { if (!config.allowWrite) throw new Error('write_not_allowed'); const p = local(config, cwd, target); await fsp.mkdir(path.dirname(p.full), { recursive:true }); await fsp.writeFile(p.full, content); return { path:p.relative, bytes:Buffer.byteLength(content) }; }
async function mkdir(config, cwd, target) { if (!config.allowWrite) throw new Error('write_not_allowed'); const p = local(config, cwd, target); await fsp.mkdir(p.full, { recursive:true }); return { path:p.relative }; }
async function remove(config, cwd, target) { if (!config.allowWrite) throw new Error('write_not_allowed'); const p = local(config, cwd, target); await fsp.rm(p.full, { recursive:true, force:true }); return { path:p.relative }; }
/** B"H: SFTP-shaped local adapter now supports guarded read/write/list/stat. */
module.exports = { local, readdir, stat, readFile, writeFile, mkdir, remove };
