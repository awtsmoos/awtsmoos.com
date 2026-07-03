// B"H
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(path.resolve('geelooy/apps/code/js/tunnel/browser-agent.js'), 'utf8');

assert(source.includes("this.status(reconnecting ? 'reconnecting' : 'disconnected')"));
assert(source.includes('reconnectDelayMs()'));
assert(source.includes('RECONNECT_MAX_MS'));
assert(source.includes("String(message || '').slice(0, 240)"));
assert(source.includes('attempt ${this.reconnectAttempt}'));

console.log(JSON.stringify({ ok: true, suite: 'browser-reconnect-status' }, null, 2));
