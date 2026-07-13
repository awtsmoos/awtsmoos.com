// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const path = require("node:path");

/**
 * B"H
 * Six fresh processes climb the six recovery rungs. The Awtsmoos lets
 * Awtsmoos.com prove that every tier has real measured overlap, not merely a
 * number written in configuration.
 */
const scenario = path.join(__dirname, "commandTierScenario.cjs");
const reports = [];

for (let tier = 0; tier <= 5; tier += 1) {
	const environment = {
		...process.env,
		AWTSMOOS_COMMAND_TIER: String(tier)
	};
	delete environment.AWTSMOOS_COMMAND_MAX_ACTIVE;
	const result = childProcess.spawnSync(
		process.execPath,
		[scenario],
		{
			env: environment,
			encoding: "utf8",
			timeout: 120000
		}
	);
	assert.equal(result.status, 0, result.stderr || result.stdout);
	reports.push(JSON.parse(result.stdout.trim()));
}

assert.deepEqual(
	reports.slice(0, 5).map(report => report.maxActive),
	[1, 1, 2, 4, 8]
);
assert.equal(reports[5].maxActive >= 4, true);
assert.ok(reports.every(report => report.maxObserved === report.maxActive));
assert.ok(reports.every(report => report.queueObserved === true));

console.log(JSON.stringify({
	ok: true,
	suite: "command-tier-multiprocess-stress",
	reports
}, null, 2));
