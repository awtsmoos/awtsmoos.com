// B"H
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const Paths = require('./paths.js');
async function write(config, jobId, meta) {
  const dir = Paths.jobDir(config, jobId), tmp = path.join(dir, `meta.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}.tmp`);
  await fsp.mkdir(dir, { recursive:true });
  await fsp.writeFile(tmp, JSON.stringify(meta, null, 2), 'utf8');
  await fsp.rename(tmp, Paths.jobFile(config, jobId, 'meta.json'));
}
async function read(config, jobId) {
  for (let i = 0; i < 8; i++) try { return JSON.parse(await fsp.readFile(Paths.jobFile(config, jobId, 'meta.json'), 'utf8')); } catch { await sleep(5 + i * 5); }
  return null;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
module.exports = { read, write, sleep };
