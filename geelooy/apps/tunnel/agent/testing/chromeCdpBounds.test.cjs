// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../tools/chrome/cdp.js'), 'utf8');

assert(source.includes('AWTSMOOS_CDP_HTTP_MAX_BYTES'), 'CDP HTTP responses must have a configurable byte cap');
assert(source.includes('Chrome DevTools HTTP response too large'), 'oversized CDP HTTP responses must fail compactly');
assert(source.includes('req.destroy(new Error("HTTP timeout'), 'CDP HTTP requests must time out');
assert(source.includes('rejectAll("Chrome DevTools socket closed.")'), 'stale CDP sockets must reject pending calls');

console.log(JSON.stringify({ ok: true, suite: 'chrome-cdp-bounds' }, null, 2));
