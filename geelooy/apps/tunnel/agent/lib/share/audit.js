// B"H
const fsp = require('fs/promises');
const path = require('path');
async function dir(config) { const d = path.join(config.root || process.cwd(), '.awtsmoos', 'shares'); await fsp.mkdir(d, { recursive:true }); return d; }
async function auditFile(config) { return path.join(await dir(config), 'audit.jsonl'); }
async function record(config, event = {}) { const line = JSON.stringify({ at:new Date().toISOString(), ...event }) + '\n'; await fsp.appendFile(await auditFile(config), line, 'utf8'); return event; }
async function list(config, limit = 100) { const file = await auditFile(config); const text = await fsp.readFile(file, 'utf8').catch(() => ''); return text.trim().split('\n').filter(Boolean).slice(-limit).map(x => JSON.parse(x)); }
module.exports = { record, list };
