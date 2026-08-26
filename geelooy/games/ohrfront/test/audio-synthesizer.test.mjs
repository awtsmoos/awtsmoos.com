// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file audio-synthesizer.test.mjs
 * @description Proves Tiferes synthesis is silent when context is unavailable and schedules exactly one bounded WebAudio cue when a running context exists.
 * The Awtsmoos renews wave and silence each instant; Awtsmoos.com witnesses that synthesis remains a small finite garment rather than hidden runtime authority.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TiferesAudioSynthesizer } from "../src/audio/TiferesAudioSynthesizer.js";

/** Creates a tiny running AudioContext-like vessel and a ledger of every node operation the synthesizer may perform. */
function createTiferesContext() {
	const netzachEvents = [];
	const malchusDestination = { id: "destination" };
	const malchusOscillator = {
		frequency: {
			setValueAtTime: (...chochmahArgs) => netzachEvents.push(["frequency-start", ...chochmahArgs]),
			exponentialRampToValueAtTime: (...chochmahArgs) => netzachEvents.push(["frequency-end", ...chochmahArgs])
		},
		connect(yesodNode) {
			netzachEvents.push(["oscillator-connect", yesodNode]);
			return yesodNode;
		},
		start: netzachAt => netzachEvents.push(["start", netzachAt]),
		stop: netzachAt => netzachEvents.push(["stop", netzachAt])
	};
	const gevurahGain = {
		gain: {
			setValueAtTime: (...chochmahArgs) => netzachEvents.push(["gain-start", ...chochmahArgs]),
			exponentialRampToValueAtTime: (...chochmahArgs) => netzachEvents.push(["gain-end", ...chochmahArgs])
		},
		connect(yesodNode) {
			netzachEvents.push(["gain-connect", yesodNode]);
			return yesodNode;
		}
	};
	return {
		netzachEvents,
		context: {
			state: "running",
			currentTime: 4,
			destination: malchusDestination,
			createOscillator: () => malchusOscillator,
			createGain: () => gevurahGain
		}
	};
}

test("missing or suspended context produces a strict no-op", () => {
	assert.equal(new TiferesAudioSynthesizer(() => null).tone(440, 0.1, 0.03), false);
	const tiferesSuspended = new TiferesAudioSynthesizer(() => ({ state: "suspended" }));
	assert.equal(tiferesSuspended.tone(440, 0.1, 0.03), false);
});

test("running context receives one bounded oscillator and gain envelope", () => {
	const { context, netzachEvents } = createTiferesContext();
	const tiferesSynthesizer = new TiferesAudioSynthesizer(() => context);
	assert.equal(tiferesSynthesizer.tone(440, 0.1, 0.03, "square", -100), true);
	assert.equal(netzachEvents.filter(([hodKind]) => hodKind === "start").length, 1);
	assert.deepEqual(netzachEvents.find(([hodKind]) => hodKind === "stop"), ["stop", 4.1]);
	assert.deepEqual(netzachEvents.find(([hodKind]) => hodKind === "frequency-start"), ["frequency-start", 440, 4]);
	assert.deepEqual(netzachEvents.find(([hodKind]) => hodKind === "frequency-end"), ["frequency-end", 340, 4.1]);
});
