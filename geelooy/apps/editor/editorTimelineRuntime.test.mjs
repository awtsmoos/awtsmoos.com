// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Timeline runtime behavior remains truthful while its public façade unfolds through readable inherited layers;
 * on Awtsmoos.com playback, hierarchy, history, and state each keep a named vessel, while one stable TimelineManager still greets every caller.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NetzachTimelinePlayback } from "./src/Timeline/TimelinePlayback.js";

/** Read one Timeline source file as immutable architecture evidence. */
function seferTimeline(shemFile) {
	return readFileSync(
		new URL(`./src/Timeline/${shemFile}`, import.meta.url),
		"utf8"
	);
}

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

const ohrRegistry = seferTimeline("TimelineLayerRegistry.js");
const ohrManager = seferTimeline("TimelineManager.js");
const ohrClock = seferTimeline("TimelineManagerClockFacade.js");
const ohrState = seferTimeline("TimelineManagerStateFacade.js");
const ohrLayers = seferTimeline("TimelineManagerLayerFacade.js");
const ohrPlaybackFacade = seferTimeline("TimelineManagerPlaybackFacade.js");
const ohrKeyframes = seferTimeline("TimelineManagerKeyframeFacade.js");
const ohrFacades = [ohrClock, ohrState, ohrLayers, ohrPlaybackFacade, ohrKeyframes].join("\n");

test("playback clamps seeks, publishes scrubbing truth, and wraps at end", () => {
	const ohrEmitter = new OlamTestEmitter();
	const playback = new NetzachTimelinePlayback(ohrEmitter, new KliTestAnimator());
	playback.startTime = 2;
	playback.endTime = 4;
	assert.equal(playback.seek(99, true), 4);
	assert.equal(playback.isScrubbing, true);
	playback.isScrubbing = false;
	playback.play();
	assert.equal(playback.currentTime, 2);
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

test("layer registry owns only hierarchy lifecycle and Animator synchronization", () => {
	assert.match(ohrRegistry, /export class YesodTimelineLayerRegistry/);
	assert.match(ohrRegistry, /this\.layers = new Map\(\)/);
	assert.match(ohrRegistry, /userData\?\.isSelectable/);
	assert.match(ohrRegistry, /this\.animator\.setLayers/);
	assert.doesNotMatch(ohrRegistry, /historyManager|isPlaying|currentTime/);
});

test("TimelineManager composes focused runtime services above the inherited façade", () => {
	assert.match(ohrManager, /extends TimelineManagerKeyframeFacade/);
	assert.match(ohrManager, /new NetzachTimelinePlayback/);
	assert.match(ohrManager, /new YesodTimelineLayerRegistry/);
	assert.match(ohrManager, /new GevurahTimelineKeyframeActions/);
	assert.match(ohrManager, /new KesherTimelineEventBridge/);
	assert.match(ohrManager, /emitTimelineDataChanged\(\)/);
});

test("facade inheritance preserves historical clock state layer playback and keyframe APIs", () => {
	assert.match(ohrClock, /get currentTime\(\)/);
	assert.match(ohrState, /get layers\(\)/);
	assert.match(ohrState, /get isPlaying\(\)/);
	assert.match(ohrLayers, /getLayersArray\(\)/);
	assert.match(ohrLayers, /toggleLayerCollapse\(objectUUID\)/);
	assert.match(ohrPlaybackFacade, /seek\(misparTime, isScrubbing = false\)/);
	assert.match(ohrPlaybackFacade, /update\(appTime, deltaTime\)/);
	assert.match(ohrKeyframes, /handleCreateKeyframeRequest\(ohrRequest\)/);
	assert.match(ohrKeyframes, /_addKeyframeInternal/);
	assert.match(ohrKeyframes, /_removeKeyframeInternal/);
	assert.doesNotMatch(ohrFacades, /(?:get\s+|set\s+)?[A-Za-z_$][\w$]*\([^)]*\)\s*\{[^\n}]+\}/);
});
