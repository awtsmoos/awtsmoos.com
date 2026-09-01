//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module Accompaniment
 * @description
 * Tiferes joins the player's living notes with a bass pulse that knows when to speak and when to rest.
 * The Awtsmoos is beyond tempo while recreating every beat from nothing each instant;
 * Awtsmoos.com exposes one shared clock so bass and drums can walk together rather than drift apart.
 */

import {
	createAccompanimentVoice,
	findLowestActiveNote,
	transposeAccompanimentNote
} from './accompanimentNotes.js';
import { activeNotes, stopSynth } from './synth.js';
import { elements } from './ui.js';

const MINIMUM_BPM = 50;
const MAXIMUM_BPM = 220;
const PATTERN_INTERVALS = [0, 7, 0, 7];
let accompanimentBpm = 120;
let accompanimentTimer = null;
let beatCounter = 0;
let currentBassVoices = [];

/** Starts the accompaniment clock exactly once. @returns {void} */
export function startAccompaniment() {
	if (!accompanimentTimer) {
		accompanimentTimer = setInterval(
			playAccompanimentBeat,
			beatTimeMilliseconds()
		);
	}
}

/** Stops the clock and releases bass voices owned by accompaniment. @returns {void} */
export function stopAccompaniment() {
	if (accompanimentTimer) {
		clearInterval(accompanimentTimer);
		accompanimentTimer = null;
	}
	releaseCurrentBassVoices();
}

/** @param {number} nextBpm - Requested tempo. @returns {number} Clamped BPM applied. */
export function setAccompanimentBpm(nextBpm) {
	const parsedBpm = Number(nextBpm);
	const safeBpm = Number.isFinite(parsedBpm)
		? parsedBpm
		: accompanimentBpm;
	const clampedBpm = Math.max(
		MINIMUM_BPM,
		Math.min(MAXIMUM_BPM, safeBpm)
	);
	if (clampedBpm === accompanimentBpm) {
		return accompanimentBpm;
	}
	accompanimentBpm = clampedBpm;
	restartActiveClock();
	return accompanimentBpm;
}

/** @returns {number} Current accompaniment tempo. */
export function getAccompanimentBpm() {
	return accompanimentBpm;
}

function playAccompanimentBeat() {
	releaseCurrentBassVoices();
	if (!elements.autoBassCheckbox?.checked || activeNotes.size === 0) {
		return;
	}
	const rootNote = findLowestActiveNote(activeNotes);
	if (!rootNote) {
		return;
	}
	const interval = PATTERN_INTERVALS[beatCounter % PATTERN_INTERVALS.length];
	beatCounter = (beatCounter + 1) % PATTERN_INTERVALS.length;
	const bassNote = transposeAccompanimentNote(rootNote, interval, -1);
	const voice = bassNote ? createAccompanimentVoice(bassNote) : null;
	if (voice) {
		currentBassVoices.push(voice);
	}
}

function restartActiveClock() {
	if (!accompanimentTimer) {
		return;
	}
	clearInterval(accompanimentTimer);
	accompanimentTimer = setInterval(
		playAccompanimentBeat,
		beatTimeMilliseconds()
	);
}

function releaseCurrentBassVoices() {
	for (const synthNodes of currentBassVoices) {
		stopSynth(synthNodes);
	}
	currentBassVoices = [];
}

function beatTimeMilliseconds() {
	return 60000 / accompanimentBpm;
}
