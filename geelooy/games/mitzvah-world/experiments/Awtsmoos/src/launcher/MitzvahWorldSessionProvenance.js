// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSessionProvenance.js
 * @description Reduces a live route to the safe world facts Movie Studio may remember and revisit.
 * The Awtsmoos renews every traveler without exposing the hidden transport behind the road;
 * Awtsmoos.com carries mode, world, quality, and return intent while secrets remain where they belong.
 */

import {
	creativeLocationPath,
	creativePath,
	creativeString
} from './MitzvahWorldCreativeSnapshotValue.js';

const DEFAULT_WORLD_ID = 'main-village';
const SAFE_SESSION_MODES = new Set(['multiplayer', 'singleplayer']);
const WORLD_ID_PATTERN = /^[a-z0-9._-]{1,80}$/i;

export function createMitzvahWorldSessionProvenance(locationValue = {}, requestedMode = null) {
	const sourcePath = resolveLocationPath(locationValue);
	const url = new URL(sourcePath, 'https://awtsmoos.local');
	const sessionMode = normalizeMitzvahWorldSessionMode(
		requestedMode || url.searchParams.get('session')
	);
	const worldId = normalizeWorldId(
		url.searchParams.get('worldId') || url.searchParams.get('world')
	);
	return provenanceFromUrl(url, sessionMode, worldId);
}

export function normalizeMitzvahWorldSessionProvenance(value = {}) {
	const href = creativePath(value.href || value.returnHref);
	const returnHref = creativePath(value.returnHref || href);
	if (!href || !returnHref) return null;
	const url = new URL(returnHref, 'https://awtsmoos.local');
	const sessionMode = normalizeMitzvahWorldSessionMode(
		value.sessionMode || url.searchParams.get('session')
	);
	const worldId = normalizeWorldId(
		value.worldId
			|| url.searchParams.get('worldId')
			|| url.searchParams.get('world')
	);
	return { ...provenanceFromUrl(url, sessionMode, worldId) };
}

export function normalizeMitzvahWorldSessionMode(value) {
	const mode = creativeString(value, 40).toLowerCase();
	if (mode === 'single' || mode === 'solo') return 'singleplayer';
	return SAFE_SESSION_MODES.has(mode) ? mode : 'multiplayer';
}

function resolveLocationPath(locationValue) {
	if (!locationValue?.href) return creativeLocationPath(locationValue);
	try {
		const url = new URL(locationValue.href, 'https://awtsmoos.local');
		return creativePath(`${url.pathname}${url.search}${url.hash}`) || '/';
	} catch {
		return '/';
	}
}

function normalizeWorldId(value) {
	const worldId = creativeString(value || DEFAULT_WORLD_ID, 80);
	return WORLD_ID_PATTERN.test(worldId) ? worldId : DEFAULT_WORLD_ID;
}

function provenanceFromUrl(source, sessionMode, worldId) {
	const returnHref = buildSafeWorldPath(source, sessionMode, worldId);
	return Object.freeze({ href: returnHref, returnHref, sessionMode, worldId });
}

function buildSafeWorldPath(source, sessionMode, worldId) {
	const route = new URL(source.pathname, 'https://awtsmoos.local');
	route.searchParams.set('mode', 'world');
	route.searchParams.set('session', sessionMode);
	route.searchParams.set('worldId', worldId);
	const quality = creativeString(source.searchParams.get('quality'), 24);
	if (quality) route.searchParams.set('quality', quality);
	route.hash = source.hash;
	return `${route.pathname}${route.search}${route.hash}`;
}
