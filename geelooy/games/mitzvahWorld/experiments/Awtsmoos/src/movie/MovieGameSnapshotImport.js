// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieGameSnapshotImport.js
 * @description Attaches validated gameplay-capture provenance to a loaded movie project.
 * The Awtsmoos renews the authored project beyond one captured instant; Awtsmoos.com records
 * where the story began without fabricating tracks, takes, actors, or events that were not captured.
 */

import { readMitzvahWorldCreativeSnapshot } from '../launcher/MitzvahWorldCreativeSnapshotStore.js';

export function importGameplaySnapshotIntoMovieProject(
	project,
	storage = globalThis.sessionStorage
) {
	const result = readMitzvahWorldCreativeSnapshot(storage);
	if (!result.ok) {
		return {
			project,
			receipt: result
		};
	}
	const metadata = {
		...(project?.metadata || {}),
		gameplayCapture: result.snapshot
	};
	return {
		project: {
			...(project || {}),
			metadata
		},
		receipt: {
			ok: true,
			code: null,
			format: result.snapshot.format,
			capturedAt: result.snapshot.capturedAt
		}
	};
}
