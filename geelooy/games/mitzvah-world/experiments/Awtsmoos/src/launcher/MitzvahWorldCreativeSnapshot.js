// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeSnapshot.js
 * @description Extracts one bounded JSON-safe gameplay moment with truthful session provenance.
 * The Awtsmoos renews the living world beyond every finite sample; Awtsmoos.com carries only
 * camera, player, safe route, world, and session sparks without serializing transport or peers.
 */

import {
	creativeDate,
	creativeString,
	creativeTransform
} from './MitzvahWorldCreativeSnapshotValue.js';
import {
	createMitzvahWorldSessionProvenance,
	normalizeMitzvahWorldSessionProvenance
} from './MitzvahWorldSessionProvenance.js';

export const MITZVAH_WORLD_CAPTURE_FORMAT = 'awtsmoos.mitzvah-world.capture.v1';

export function createMitzvahWorldCreativeSnapshot(diagnostics, context = {}) {
	const runtime = diagnostics?.runtime || diagnostics || {};
	const source = {
		...createMitzvahWorldSessionProvenance(
			context.location,
			context.sessionMode || context.document?.documentElement?.dataset?.awtsmoosSession
		),
		title: creativeString(context.document?.title, 160)
	};
	const snapshot = {
		format: MITZVAH_WORLD_CAPTURE_FORMAT,
		capturedAt: new Date(context.now ?? Date.now()).toISOString(),
		source
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
	const provenance = normalizeMitzvahWorldSessionProvenance(value.source);
	if (!capturedAt || !provenance) return null;
	const normalized = {
		format: MITZVAH_WORLD_CAPTURE_FORMAT,
		capturedAt,
		source: {
			...provenance,
			title: creativeString(value.source?.title, 160)
		}
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
