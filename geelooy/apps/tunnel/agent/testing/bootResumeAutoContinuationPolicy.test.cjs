// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Boot = require("../lib/runtime/boot-resume-loop.js");

/**
 * @file Proves runtime continuation is default-on only for the steady runtime and impossible in candidate probes.
 * @description
 * The Awtsmoos lets the installed shliach remember unfinished work; Awtsmoos.com
 * keeps the readonly candidate silent so installation proof can never summon a browser or a phantom mission.
 */
(() => {
	assert.equal(Boot.enabled({}), true);
	assert.equal(Boot.enabled({ AWTSMOOS_MISSION_BOOT_RESUME: "0" }), false);
	assert.equal(Boot.autoMission({}), false);
	assert.equal(Boot.autoMission({ AWTSMOOS_AUTO_MISSION: "1" }), true);
	assert.equal(Boot.candidateProbe({ AWTSMOOS_REGISTRATION_MODE: "candidate-probe" }), true);
	assert.equal(Boot.enabled({ AWTSMOOS_REGISTRATION_MODE: "candidate-probe" }), false);

	let logs = 0;
	const candidate = Boot.start(() => { logs += 1; }, { root: "/tmp/never-used" }, {
		env: { AWTSMOOS_REGISTRATION_MODE: "candidate-probe" }
	});
	assert.equal(candidate, null);
	assert.equal(logs, 1);

	const disabled = Boot.start(() => {}, { root: "/tmp/never-used" }, {
		env: { AWTSMOOS_MISSION_BOOT_RESUME: "0" }
	});
	assert.equal(disabled, null);

	console.log(JSON.stringify({
		ok: true,
		suite: "boot-resume-auto-continuation-policy",
		steadyDefaultEnabled: true,
		candidateSuppressed: true,
		bootDoesNotInventMission: true
	}));
})();
