//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const {
	TARGET_PROFILES,
	hostCapabilityNames,
	targetProfile
} = require('../index.js');

/**
 * Locks the five required deployment families and the minimum portable host ABI.
 */
function run() {
	const required = ['browser', 'windows', 'macos', 'linux', 'android'];
	for (const id of required) {
		assert.ok(TARGET_PROFILES[id], `missing target ${id}`);
		assert.equal(targetProfile(id).id, id);
		assert.ok(targetProfile(id).graphics.length > 0);
	}
	const capabilities = hostCapabilityNames();
	for (const name of [
		'graphics.createSurface',
		'input.onTextComposition',
		'network.fetch',
		'timers.requestAnimationFrame'
	]) {
		assert.ok(capabilities.includes(name), `missing capability ${name}`);
	}
	console.log(JSON.stringify({
		capabilities: capabilities.length,
		ok: true,
		targets: required
	}));
}

run();
