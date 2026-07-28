// B"H

const assert = require("node:assert/strict");
const Protocol = require("../lib/connection-vessel/protocol.js");

const statsMessage = Protocol.message(Protocol.TYPES.STATS, {
	stats: {
		workers: {
			activeTotal: 12,
			active: {
				worker_one: {
					jobId: "job_one",
					state: "running"
				}
			}
		}
	}
});

assert.equal(Protocol.valid(statsMessage), true);
assert.equal(statsMessage.stats.workers.activeTotal, 12);
assert.equal(statsMessage.stats.workers.active.worker_one.jobId, "job_one");
console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-stats",
	boundedParentStatsAccepted: true
}, null, 2));
