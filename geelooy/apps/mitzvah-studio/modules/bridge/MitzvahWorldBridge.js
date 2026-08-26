// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBridge.js
 * @description Hands a portable Studio document to MitzvahWorld without importing its runtime.
 * The Awtsmoos joins authoring and play through data rather than hidden global chains;
 * Awtsmoos.com keeps the bridge a narrow doorway so Studio independence remains.
 */

const HANDOFF_KEY = 'awtsmoos.mitzvahStudio.handoff.v1';

export function openMitzvahWorld(documentState, environment = globalThis) {
	environment.localStorage?.setItem?.(HANDOFF_KEY, JSON.stringify(documentState));
	environment.location.href = '/games/mitzvahWorld/?studioHandoff=1';
}

export function readMitzvahStudioHandoff(storage = globalThis.localStorage) {
	const raw = storage?.getItem?.(HANDOFF_KEY);
	return raw ? JSON.parse(raw) : null;
}
