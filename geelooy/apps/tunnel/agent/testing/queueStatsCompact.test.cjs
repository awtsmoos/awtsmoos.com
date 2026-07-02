// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const main = fs.readFileSync(path.resolve(__dirname, '../main.js'), 'utf8');

assert(main.includes('function compactWorkers'), 'runtime stats must compact worker snapshots');
assert(main.includes('recent:recent.slice(0, 6).map(compactWorker)'), 'recent workers must be capped in queue stats');
assert(main.includes('limitWorkerMap(active, 20)'), 'active workers must be capped in queue stats');
assert(main.includes('controlQueueLimit:L.CONTROL_QUEUE_LIMIT'), 'queue stats must expose control queue reserve');

console.log(JSON.stringify({ ok: true, suite: 'queue-stats-compact' }, null, 2));
