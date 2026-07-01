// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const limits = fs.readFileSync(path.join(root, 'lib/runtime/limits.js'), 'utf8');

for (const forbidden of ['agent_lane_timeout', 'agent_queue_timeout', 'status:504']) {
  assert(!main.includes(forbidden), `runtime must not contain ${forbidden}`);
}
for (const required of ['TUNNEL_PROGRESS', 'queued_waiting_for_lane', 'lane_advisory_overtime', 'longLivedConnection']) {
  assert(main.includes(required), `runtime must expose ${required}`);
}
for (const required of ['KEEPALIVE_MS', 'LONG_LIVED_CONNECTIONS', '4 * HOUR', '12 * HOUR', '7 * DAY']) {
  assert(limits.includes(required), `limits must expose ${required}`);
}
console.log(JSON.stringify({ ok:true, suite:'long-lived-connection-policy' }));
