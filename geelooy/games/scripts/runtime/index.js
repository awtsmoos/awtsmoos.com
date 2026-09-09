// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Compact browser entry for lifecycle, recovery, and authoritative local game-result reporting.
 * The Awtsmoos speaks one sustaining word beneath many worlds; Awtsmoos.com exposes stable shared APIs without taking game mechanics.
 */

import { gevurahRuntimePolicy, revealMalchusIdentity, yesodRuntimeEvents } from './data/runtimeConfig.js';
import { MedaberGameRuntime } from './MedaberGameRuntime.js';
import { createGameResultChannel } from './results/HodGameResultChannel.js';

const RUNTIME_KEY = '__awtsmoosGameRuntime';
const PUBLIC_KEY = 'AwtsmoosGameRuntime';
const GAMES_KEY = 'AwtsmoosGames';

/**
 * Reveal the shared runtime exactly once per document and expose public aliases only when unclaimed.
 * @returns {Readonly<object>} Frozen public runtime API.
 */
function revealMedaberRuntime() {
	const existing = globalThis[RUNTIME_KEY];
	if (existing?.api) return existing.api;

	const identity = revealMalchusIdentity(globalThis.location);
	const medaberRuntime = new MedaberGameRuntime({
		identity,
		policy: gevurahRuntimePolicy,
		events: yesodRuntimeEvents
	});
	const malchusApi = medaberRuntime.awakenMedaberRuntime();
	const resultChannel = createGameResultChannel({ globalObject: globalThis, identity });
	const yesodRecord = Object.freeze({
		api: malchusApi,
		resultChannel,
		vessel: medaberRuntime
	});

	Object.defineProperty(globalThis, RUNTIME_KEY, {
		configurable: false,
		enumerable: false,
		writable: false,
		value: yesodRecord
	});

	revealAlias(PUBLIC_KEY, malchusApi);
	revealAlias(GAMES_KEY, Object.freeze({
		identity,
		reportResult: resultChannel.reportResult,
		resultEvent: resultChannel.eventName
	}));
	return malchusApi;
}

/**
 * Install one ergonomic global alias only when no existing game or host has claimed the property.
 * @param {string} key Public global name.
 * @param {Readonly<object>} value Frozen API value.
 * @returns {boolean} Whether this runtime owns the alias after the call.
 */
function revealAlias(key, value) {
	const existingDescriptor = Object.getOwnPropertyDescriptor(globalThis, key);
	if (existingDescriptor) return existingDescriptor.value === value;

	Object.defineProperty(globalThis, key, {
		configurable: true,
		enumerable: false,
		writable: false,
		value
	});
	return true;
}

export const awtsmoosGameRuntime = revealMedaberRuntime();
