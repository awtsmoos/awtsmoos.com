//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const Transport = require("../tools/fs/mission/autoContinuation/sharedShliachTransport.js");

/**
 * @file Shared-Shliach continuation transport witnesses.
 * @description The Awtsmoos carries unfinished Mission debt through the already-authenticated
 * Shared AI Browser; Awtsmoos.com proves live adoption, canonical recovery, persistence, and exact close.
 */

function receipt(closed = true) {
	return {
		ok: true,
		sent: true,
		persisted: true,
		closed,
		chromeTargetId: "tab_successor",
		conversationId: "conversation_test_123",
		href: `${Transport.SHLIACH_URL}/c/conversation_test_123`
	};
}

async function registryCompatibility() {
	const calls = [];
	const result = await Transport.dispatch({ prompt: "B\"H continue mission" }, {
		registry: async () => ({ port: 51240, profile: Transport.SHARED_PROFILE }),
		submit: async input => {
			calls.push(input);
			return receipt();
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.browserSource, "registry");
	assert.equal(result.closed, true);
	assert.equal(calls[0].port, 51240);
	assert.equal(new URL(calls[0].url).searchParams.get("prompt"), "B\"H continue mission");
}

async function liveAuthorityWins() {
	let opens = 0;
	const calls = [];
	const sharedBrowser = {
		authority: () => ({ ok: true, port: 51241 }),
		profilePath: () => "/tmp/shared-live",
		open: async () => { opens += 1; return { ok: true }; }
	};
	const result = await Transport.dispatch({ prompt: "B\"H live" }, {
		sharedBrowser,
		submit: async input => { calls.push(input); return receipt(); }
	});
	assert.equal(result.browserSource, "live");
	assert.equal(result.port, 51241);
	assert.equal(result.profile, "/tmp/shared-live");
	assert.equal(opens, 0);
	assert.equal(calls[0].port, 51241);
}

async function missingAuthorityRecoversOnce() {
	let observations = 0;
	let opens = 0;
	const sharedBrowser = {
		authority() {
			observations += 1;
			return observations === 1 ? { ok: false } : { ok: true, port: 51242 };
		},
		profilePath: () => "/tmp/shared-recovered",
		open: async () => { opens += 1; return { ok: true }; }
	};
	const result = await Transport.dispatch({ prompt: "B\"H recover" }, {
		sharedBrowser,
		submit: async input => {
			assert.equal(input.port, 51242);
			return receipt();
		}
	});
	assert.equal(result.browserSource, "recovered");
	assert.equal(result.profile, "/tmp/shared-recovered");
	assert.equal(opens, 1);
	assert.equal(observations, 2);
}

async function closeFailureRemainsFailure() {
	const result = await Transport.dispatch({ prompt: "B\"H close me" }, {
		registry: async () => ({ port: 51240, profile: Transport.SHARED_PROFILE }),
		submit: async () => receipt(false)
	});
	assert.equal(result.ok, false);
	assert.equal(result.error, "shared_shliach_close_failed");
	assert.equal(result.result.persisted, true);
}

async function main() {
	await registryCompatibility();
	await liveAuthorityWins();
	await missingAuthorityRecoversOnce();
	await closeFailureRemainsFailure();
	console.log(JSON.stringify({ ok: true, suite: "continuation-shared-browser-authority" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
