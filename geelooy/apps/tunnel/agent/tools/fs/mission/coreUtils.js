// B"H
const crypto = require('crypto');
const { safePath } = require('../pathGuard.js');

const DIR = '.awtsmoos/missions';
const LETTERS = 'ABCDE'.split('');
const LIST_SPLIT = new RegExp('\\r?\\n|,');

function id(prefix = 'mission') {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(5).toString('hex')}`;
}
function clean(v) {
  return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '');
}
function dir(config, mid = '') {
  return safePath(config, mid ? `${DIR}/${clean(mid)}` : DIR);
}
function file(config, mid) {
  return safePath(config, `${DIR}/${clean(mid)}/mission.json`);
}
function list(v, fallback = []) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    return v.split(LIST_SPLIT).map(x => x.trim()).filter(Boolean);
  }
  return fallback;
}
function now() {
  return new Date().toISOString();
}
function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * B"H
 * The smallest sparks: path, time, number, name.
 * Every larger chamber receives these quiet servants and stops pretending that
 * a giant file must carry the whole palace on one bent shoulder.
 */
module.exports = { DIR, LETTERS, id, clean, dir, file, list, now, num };
