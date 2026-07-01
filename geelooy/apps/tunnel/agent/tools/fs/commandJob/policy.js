// B"H
const os = require('os');
const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 50000;
const STREAM_MAX_BYTES = Number(process.env.AWTSMOOS_COMMAND_STREAM_MAX_BYTES || 5 * 1024 * 1024);
const STORE_MAX_BYTES = Number(process.env.AWTSMOOS_COMMAND_STORE_MAX_BYTES || 50 * 1024 * 1024);
const TTL_MS = Number(process.env.AWTSMOOS_COMMAND_JOB_TTL_MS || 30 * 60 * 1000);
const DEFAULT_HTTP_SAFE_WAIT_MS = 25000;
const TERMINAL = new Set(['completed','failed','timed_out','cancelled']);
function boundedPageChars(v) { const n = Number(v || DEFAULT_PAGE_CHARS); return Math.max(1, Math.min(Number.isFinite(n) ? Math.floor(n) : DEFAULT_PAGE_CHARS, MAX_PAGE_CHARS)); }
function boundedTimeout(v) { const n = Number(v || 86400000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, 86400000)); }
function waitCapMs() { return Math.max(100, Math.min(Number(process.env.AWTSMOOS_HTTP_SAFE_WAIT_MS || DEFAULT_HTTP_SAFE_WAIT_MS), 25000)); }
function defaultShell() { return os.platform() === 'win32' ? process.env.ComSpec || 'cmd.exe' : '/bin/sh'; }
function cleanId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
module.exports = { DEFAULT_PAGE_CHARS, MAX_PAGE_CHARS, STREAM_MAX_BYTES, STORE_MAX_BYTES, TTL_MS, TERMINAL, boundedPageChars, boundedTimeout, waitCapMs, defaultShell, cleanId };
