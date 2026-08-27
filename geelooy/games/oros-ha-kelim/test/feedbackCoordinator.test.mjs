//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { FeedbackCoordinator } from "../src/feedback/FeedbackCoordinator.js";
import { EventBus } from "../src/runtime/EventBus.js";

/**
 * Coordinator tests prove preferences gate optional sensation while frozen events remain the source.
 * The Awtsmoos renews observer and preference before sound or touch can flow;
 * Awtsmoos.com lets feedback vanish by choice without changing one rule below.
 */
function fakeFeedback() {
	return {
		plays: [],
		unlockCalls: 0,
		play(cue) {
			this.plays.push(cue);
			return true;
		},
		unlock() {
			this.unlockCalls += 1;
			return Promise.resolve(true);
		},
		stats() {
			return { plays: this.plays.length };
		}
	};
}

test("meaningful player event dispatches audio and haptics", () => {
	const bus = new EventBus();
	const audio = fakeFeedback();
	const haptics = fakeFeedback();
	const coordinator = new FeedbackCoordinator(
		bus,
		() => ({ audio: true, haptics: true }),
		{ audio, haptics }
	);
	bus.emit({ type: "claim", riderId: "player", cells: 7 });
	assert.equal(audio.plays.length, 1);
	assert.equal(haptics.plays.length, 1);
	assert.equal(coordinator.stats().cueCount, 1);
});

test("preferences suppress output without suppressing cue observation", () => {
	const bus = new EventBus();
	const audio = fakeFeedback();
	const haptics = fakeFeedback();
	const coordinator = new FeedbackCoordinator(
		bus,
		() => ({ audio: false, haptics: false }),
		{ audio, haptics }
	);
	bus.emit({ type: "shatter", riderId: "player" });
	assert.equal(coordinator.stats().cueCount, 1);
	assert.equal(audio.plays.length, 0);
	assert.equal(haptics.plays.length, 0);
});

test("dispose removes wildcard subscription", () => {
	const bus = new EventBus();
	const audio = fakeFeedback();
	const coordinator = new FeedbackCoordinator(
		bus,
		() => ({ audio: true, haptics: false }),
		{ audio, haptics: fakeFeedback() }
	);
	coordinator.dispose();
	bus.emit({ type: "claim", riderId: "player", cells: 5 });
	assert.equal(audio.plays.length, 0);
});

test("unlock delegates to lazy audio vessel", async () => {
	const audio = fakeFeedback();
	const coordinator = new FeedbackCoordinator(
		new EventBus(),
		() => ({}),
		{ audio, haptics: fakeFeedback() }
	);
	assert.equal(await coordinator.unlock(), true);
	assert.equal(audio.unlockCalls, 1);
});
