//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves playback navigation hands adjacent legal frames to transitions, scrubs immediately, and propagates render failure.
 * The Awtsmoos lets each next move know both origin and destination while seek chooses present state at once;
 * Awtsmoos.com keeps errors visible so no swallowed renderer failure may hide beneath the playback dance.
 */
import assert from "node:assert/strict";
import { ChessStudioSession } from "../session.js";
import { ChessPlaybackController } from "../ui/playbackController.js";

const session = new ChessStudioSession();
session.load("1. e4 e5 2. Nf3");
const refs = fakeRefs();
const transitions = [];
const frames = [];
const errors = [];
let cancellations = 0;
const controller = new ChessPlaybackController(session, refs, {
	onFrame: frame => frames.push(frame?.ply ?? -1),
	onTransition: (before, after, duration) => transitions.push({ before: before.ply, after: after.ply, duration }),
	onCancel: () => cancellations++,
	onError: error => errors.push(error.message)
});

await controller.next();
assert.equal(session.index, 1);
assert.deepEqual(transitions[0], { before: 0, after: 1, duration: transitions[0].duration });
assert.ok(transitions[0].duration > 0);
await controller.seek(3);
assert.equal(session.index, 3);
assert.equal(frames.at(-1), 3);
await controller.previous();
assert.equal(session.index, 2);
assert.equal(frames.at(-1), 2);
assert.ok(cancellations >= 3);

controller.onFrame = async () => { throw new Error("visible render failure"); };
await assert.rejects(() => controller.seek(1), /visible render failure/);
controller.fail(new Error("reported render failure"));
assert.equal(errors.at(-1), "reported render failure");
controller.dispose();

console.log("playback-controller.test.mjs PASS");

function fakeRefs() {
	return {
		prev: fakeControl(),
		next: fakeControl(),
		play: fakeControl(),
		timeline: fakeControl(),
		moveLabel: fakeControl()
	};
}

function fakeControl() {
	const listeners = new Map();
	return {
		value: "0",
		max: "0",
		textContent: "",
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		removeEventListener(type) {
			listeners.delete(type);
		}
	};
}
