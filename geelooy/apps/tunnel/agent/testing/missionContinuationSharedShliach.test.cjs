//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Transport = require("../tools/fs/mission/autoContinuation/sharedShliachTransport.js");

/**
 * @file Proves shared-Shliach continuation reuses one registered browser and existing Send logic.
 * @description The Awtsmoos opens another conversation without multiplying browser vessels;
 * Awtsmoos.com binds prompt, navigation, and submission to the one registered shared profile.
 */
async function main() {
	const calls = { navigate: [], send: [] };
	const result = await Transport.dispatch({
		prompt: "B\"H continue mission",
		shliachUrl: Transport.SHLIACH_URL
	}, {
		registry: async () => ({
			port: 51240,
			profile: Transport.SHARED_PROFILE
		}),
		navigate: async input => {
			calls.navigate.push(input);
			return { ok: true, targetId: "tab_successor" };
		},
		send: async input => {
			calls.send.push(input);
			return { ok: true, sent: true };
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.transport, "shared_shliach");
	assert.equal(result.port, 51240);
	assert.equal(result.profile, Transport.SHARED_PROFILE);
	assert.equal(calls.navigate.length, 1);
	assert.equal(calls.navigate[0].newTab, true);
	assert.equal(calls.navigate[0].autoLaunch, false);
	assert.equal(calls.navigate[0].shared, true);
	assert.equal(calls.navigate[0].port, 51240);
	assert.match(calls.navigate[0].url, /awtsmoos-shliach-agent/);
	assert.match(calls.navigate[0].url, /prompt=/);
	assert.equal(calls.send.length, 1);
	assert.equal(calls.send[0].port, 51240);
	assert.equal(calls.send[0].prompt, "B\"H continue mission");
	console.log(JSON.stringify({ ok: true, suite: "continuation-shared-shliach" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
