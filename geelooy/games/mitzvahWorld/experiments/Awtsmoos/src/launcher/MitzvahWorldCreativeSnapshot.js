// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeSnapshot.js
 * @description Extracts one bounded JSON-safe gameplay moment for Movie Studio provenance.
 * The Awtsmoos renews the living world beyond every finite sample; Awtsmoos.com carries only
 * camera, player, route, and session sparks across the doorway without serializing the world itself.
 */

import {
	creativeDate,
	creativeLocationPath,
	creativePath,
	creativeString,
	creativeTransform
} from './MitzvahWorldCreativeSnapshotValue.js';

export const MITZVAH_WORLD_CAPTURE_FORMAT = 'awtsmoos.mitzvah-world.capture.v1';

export function createMitzvahWorldCreativeSnapshot(diagnostics, context = {}) {
	const runtime = diagnostics?.runtime || diagnostics || {};
	const href = creativeLocationPath(context.location);
	const snapshot = {
		format: MITZVAH_WORLD_CAPTURE_FORMAT,
		capturedAt: new Date(context.now ?? Date.now()).toISOString(),
		source: {
			href,
			returnHref: href,
			sessionMode: creativeString(
				context.sessionMode
					|| context.document?.documentElement?.dataset?.awtsmoosSession
					|| 'unknown',
				40
			),
			title: creativeString(context.document?.title, 160)
		}
	};
	const camera = creativeTransform(runtime.camera, true);
	const playerSource = runtime.player || runtime.avatar || runtime.controls?.target;
	const player = creativeTransform(playerSource);
	if (camera) snapshot.camera = camera;
	if (player) {
		const id = creativeString(playerSource?.id || playerSource?.name, 120);
		snapshot.player = id ? { id, ...player } : player;
	}
	return normalizeMitzvahWorldCreativeSnapshot(snapshot);
}

export function normalizeMitzvahWorldCreativeSnapshot(value) {
	if (!value || value.format !== MITZVAH_WORLD_CAPTURE_FORMAT) return null;
	const capturedAt = creativeDate(value.capturedAt);
	const source = normalizeSource(value.source);
	if (!capturedAt || !source) return null;
	const normalized = {
		format: MITZVAH_WORLD_CAPTURE_FORMAT,
		capturedAt,
		source
	};
	const camera = creativeTransform(value.camera, true);
	const player = creativeTransform(value.player);
	if (camera) normalized.camera = camera;
	if (player) {
		const id = creativeString(value.player?.id, 120);
		normalized.player = id ? { id, ...player } : player;
	}
	return normalized;
}

function normalizeSource(value) {
	const href = creativePath(value?.href);
	const returnHref = creativePath(value?.returnHref || href);
	if (!href || !returnHref) return null;
	return {
		href,
		returnHref,
		sessionMode: creativeString(value?.sessionMode || 'unknown', 40),
		title: creativeString(value?.title, 160)
	};
}
