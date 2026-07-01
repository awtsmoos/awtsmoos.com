// B"H
const path = require('path');
const fsp = require('fs/promises');
const Device = require('../deviceStateRoot.js');
const P = require('./policy.js');
const DIR = 'command-jobs';
function storeRoot(config = {}) { return path.join(Device.awtsmoosRoot(config), DIR); }
function jobDir(config = {}, jobId = '') { return path.join(storeRoot(config), P.cleanId(jobId)); }
function jobFile(config, jobId, name) { return path.join(jobDir(config, jobId), name); }
async function ensureDir(config, jobId = '') { await fsp.mkdir(jobId ? jobDir(config, jobId) : storeRoot(config), { recursive:true }); }
async function readText(config, jobId, name) { try { return await fsp.readFile(jobFile(config, jobId, name), 'utf8'); } catch { return ''; } }
async function sizeOf(p) { try { return (await fsp.stat(p)).size; } catch { return 0; } }
module.exports = { DIR, storeRoot, jobDir, jobFile, ensureDir, readText, sizeOf };
