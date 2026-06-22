// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const main = fs.readFileSync(path.resolve(__dirname, '../main.js'), 'utf8');

/**
 * B"H
 * Chapter 519: A confused kind may not drag a mission into the proxy abyss.
 * If the control server mislabels kind as tunnel.read/tunnel.write/http-ish,
 * the agent must still route known action families to their own handlers.
 */
assert(main.includes('function normalizePayloadKind(payload = {})'), 'normalizePayloadKind exists');
assert(main.includes('if (action.startsWith("mission")) return "fs";'), 'mission actions self-route to fs');
assert(main.includes('if (action.startsWith("command")'), 'command actions self-route to command');
assert(main.includes('if (action.startsWith("chrome")) return "chrome";'), 'chrome actions self-route to chrome');
assert(main.includes('unknown_payload_kind'), 'unknown kind returns structured error instead of proxy fallback');
assert(!main.includes('else { proxyLocalHttp(loadConfig(), data, ws); return; }'), 'old proxy fallback removed');
console.log(JSON.stringify({ ok: true, suite: 'payload-kind-normalization-regression' }, null, 2));
