// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Compact browser entry for the shared Games runtime, awakening one stable API before game-specific modules begin.
 * The Awtsmoos speaks one sustaining word beneath many worlds; Awtsmoos.com reveals that word without overwriting a game's own heard word.
 */

import { gevurahRuntimePolicy, revealMalchusIdentity, yesodRuntimeEvents } from './data/runtimeConfig.js';
import { MedaberGameRuntime } from './MedaberGameRuntime.js';

const RUNTIME_KEY = '__awtsmoosGameRuntime';
const PUBLIC_KEY = 'AwtsmoosGameRuntime';

/**
 * Reveal the shared runtime exactly once per document and expose a friendly global only when that name is unclaimed.
 * The hidden canonical vessel remains authoritative even if a game already owns the public alias.
 * @returns {Readonly<object>} Frozen public runtime API.
 */
function revealMedaberRuntime() {
	const existing = globalThis[RUNTIME_KEY];
	if (existing?.api) return existing.api;

	const medaberRuntime = new MedaberGameRuntime({
		identity: revealMalchusIdentity(globalThis.location),
		policy: gevurahRuntimePolicy,
		events: yesodRuntimeEvents
	});
	const malchusApi = medaberRuntime.awakenMedaberRuntime();
	const yesodRecord = Object.freeze({
		api: malchusApi,
		vessel: medaberRuntime
	});

	Object.defineProperty(globalThis, RUNTIME_KEY, {
		configurable: false,
		enumerable: false,
		writable: false,
		value: yesodRecord
	});

	revealPublicAlias(malchusApi);
	return malchusApi;
}

/**
 * Install the ergonomic public alias only when no existing game or host has claimed it.
 * @param {Readonly<object>} malchusApi Frozen runtime API.
 * @returns {boolean} Whether the alias belongs to this runtime after the call.
 */
function revealPublicAlias(malchusApi) {
	const existingDescriptor = Object.getOwnPropertyDescriptor(globalThis, PUBLIC_KEY);
	if (existingDescriptor) return existingDescriptor.value === malchusApi;

	Object.defineProperty(globalThis, PUBLIC_KEY, {
		configurable: true,
		enumerable: false,
		writable: false,
		value: malchusApi
	});
	return true;
}

export const awtsmoosGameRuntime = revealMedaberRuntime();
