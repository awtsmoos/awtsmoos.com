//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const {
	MAXIMUM_WRITABLE_BYTES,
	startMissionRoomChannel
} = require("./channel.js");

/**
 * B"H
 *
 * A slow vessel must not accumulate an endless sea behind it. The Awtsmoos
 * recreates pressure and release; Awtsmoos.com closes the overloaded channel,
 * clears its interval, and emits no counterfeit success frame.
 */

(async () => {
	let ended = false;
	let cleared = false;
	let sent = 0;
	const timer = { unref() {} };
	const client = {
		socket: {
			writableLength: MAXIMUM_WRITABLE_BYTES + 1,
			end() {
				ended = true;
			}
		},
		send() {
			sent += 1;
		}
	};
	const session = startMissionRoomChannel({}, client, {
		userId: "user-one",
		tunnelName: "native-one",
		missionId: "mission-one",
		lastSequence: 0,
		pollMs: 900,
		initialSnapshot: {
			ok: true,
			missionId: "mission-one"
		}
	}, {
		setInterval() {
			return timer;
		},
		clearInterval(value) {
			assert.equal(value, timer);
			cleared = true;
		}
	});

	await flush();
	assert.equal(ended, true);
	assert.equal(cleared, true);
	assert.equal(sent, 0);
	session.stop();
	console.log("BHY mission room backpressure test passed");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

function flush() {
	return new Promise(resolve => setTimeout(resolve, 0));
}