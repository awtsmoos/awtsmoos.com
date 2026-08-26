// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Timeline runtime state flows through small services instead of one hidden monolith;
 * on Awtsmoos.com executable playback stays browser-independent while layer ownership is verified without inventing a fake Three.js world.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NetzachTimelinePlayback } from "./src/Timeline/TimelinePlayback.js";

/** Tiny historical event river used to observe playback revelations. */
class OlamTestEmitter {
	constructor() {
		this.events = [];
	}

	/** Record one emitted event and payload without introducing browser dependencies. */
	emit(name, payload) {
		this.events.push({ name, payload });
	}
}

/** Minimal Animator-compatible vessel that records accepted timeline instants. */
class KliTestAnimator {
	constructor() {
		this.times = [];
	}

	/** Record the currently revealed timeline instant. */
	update(time) {
		this.times.push(time);
	}
}

const ohrRegistry = readFileSync(
	new URL("./src/Timeline/TimelineLayerRegistry.js", import.meta.url),
	"utf8"
);
const ohrManager = readFileSync(
	new URL("./src/Timeline/TimelineManager.js", import.meta.url),
	"utf8"
);

test("playback clamps seeks, publishes scrubbing truth, and wraps at end", () => {
	const ohrEmitter = new OlamTestEmitter();
	const kliAnimator = new KliTestAnimator();
	const playback = new NetzachTimelinePlayback(ohrEmitter, kliAnimator);
	playback.startTime = 2;
	playback.endTime = 4;
	assert.equal(playback.seek(99, true), 4);
	assert.equal(playback.currentTime, 4);
	assert.equal(playback.isScrubbing, true);
	assert.deepEqual(ohrEmitter.events.at(-1), {
		name: "timeChanged",
		payload: { currentTime: 4, isScrubbing: true }
	});
	playback.isScrubbing = false;
	playback.play();
	assert.equal(playback.currentTime, 2);
	assert.equal(playback.isPlaying, true);
	playback.update(0, 3);
	assert.equal(playback.currentTime, 2);
	playback.pause();
	assert.equal(playback.isPlaying, false);
});

test("play and pause publish one canonical playback-state event each", () => {
	const ohrEmitter = new OlamTestEmitter();
	const playback = new NetzachTimelinePlayback(ohrEmitter, new KliTestAnimator());
	playback.play();
	playback.play();
	playback.pause();
	playback.pause();
	assert.deepEqual(ohrEmitter.events.filter(ohr => ohr.name === "playbackStateChanged"), [
		{ name: "playbackStateChanged", payload: { isPlaying: true } },
		{ name: "playbackStateChanged", payload: { isPlaying: false } }
	]);
});

test("layer registry owns only layer lifecycle, collapse, and Animator synchronization", () => {
	assert.match(ohrRegistry, /export class YesodTimelineLayerRegistry/);
	assert.match(ohrRegistry, /this\.layers = new Map\(\)/);
	assert.match(ohrRegistry, /new Layer\(/);
	assert.match(ohrRegistry, /userData\?\.isSelectable/);
	assert.match(ohrRegistry, /kliLayer\.collapsed = !kliLayer\.collapsed/);
	assert.match(ohrRegistry, /this\.animator\.setLayers/);
	assert.doesNotMatch(ohrRegistry, /historyManager|isPlaying|currentTime/);
});

test("TimelineManager remains a compatibility façade over focused runtime services", () => {
	assert.match(ohrManager, /new NetzachTimelinePlayback/);
	assert.match(ohrManager, /new YesodTimelineLayerRegistry/);
	assert.match(ohrManager, /new GevurahTimelineKeyframeActions/);
	assert.match(ohrManager, /new KesherTimelineEventBridge/);
	assert.match(ohrManager, /_addKeyframeInternal/);
	assert.match(ohrManager, /_removeKeyframeInternal/);
	assert.match(ohrManager, /get currentTime\(\)/);
	assert.match(ohrManager, /get isPlaying\(\)/);
});
