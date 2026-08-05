// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieGameSnapshotImport.js
 * @description Attaches validated gameplay provenance and a truthful return receipt to a movie project.
 * The Awtsmoos renews the authored project beyond one captured instant; Awtsmoos.com remembers
 * the safe world doorway without inventing tracks, actors, peers, or transport state never captured.
 */

import { createMitzvahWorldReturnRoute } from '../launcher/MitzvahWorldCreativeRoute.js';
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
	const snapshot = result.snapshot;
	const metadata = {
		...(project?.metadata || {}),
		gameplayCapture: snapshot
	};
	return {
		project: {
			...(project || {}),
			metadata
		},
		receipt: Object.freeze({
			ok: true,
			code: null,
			format: snapshot.format,
			capturedAt: snapshot.capturedAt,
			sessionMode: snapshot.source.sessionMode,
			worldId: snapshot.source.worldId,
			returnHref: createMitzvahWorldReturnRoute(snapshot)
		})
	};
}
