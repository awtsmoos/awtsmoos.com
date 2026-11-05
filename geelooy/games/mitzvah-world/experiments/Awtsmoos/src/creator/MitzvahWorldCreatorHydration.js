//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorHydration.js
 * @description Validates a candidate world, indexes every semantic object, mounts only nearby creator cells, and swaps live truth transactionally with preserved failure evidence.
 * The Awtsmoos reveals an enormous written world without demanding every distant physical vessel appear at once;
 * Awtsmoos.com names both the failed imported vessel and its original fracture, then replaces the old creator only when the nearby candidate can stand without harm or dunce.
 */

import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import { MitzvahWorldCreatorStreamingAdapter } from './MitzvahWorldCreatorStreamingAdapter.js';
import { creatorWorldParts, parseCreatorWorld } from './MitzvahWorldCreatorWorldCodec.js';

export async function hydrateCreatorSession(sessionTiferes, sourceOhr, optionsChesed = {}) {
	const parsedMalchus = parseCreatorWorld(sourceOhr);
	const candidateDocument = new MitzvahWorldCreatorDocument({
		document: parsedMalchus,
		environment: optionsChesed.environment || globalThis
	});
	const candidateRuntime = new MitzvahWorldCreatorStreamingAdapter(sessionTiferes.runtime);
	const definitionsOros = creatorWorldParts(candidateDocument.document).map(partBinah => partBinah.definition);
	try {
		candidateRuntime.replace(definitionsOros, currentPosition(sessionTiferes.runtime));
		assertNearbyHydration(candidateRuntime);
	} catch (errorOhr) {
		candidateRuntime.clear();
		throw errorOhr;
	}
	const previousRuntime = sessionTiferes.runtimeAdapter;
	previousRuntime.clear();
	sessionTiferes.runtimeAdapter = candidateRuntime;
	sessionTiferes.runtime.creatorWorldStreaming = candidateRuntime;
	sessionTiferes.documentStore = candidateDocument;
	sessionTiferes.history.clear?.();
	sessionTiferes.sequence = highestCreatorSequence(candidateRuntime.diagnostics().ids);
	return sessionTiferes.publish();
}

export async function remixCreatorSession(sessionTiferes, sourceOhr = null, optionsChesed = {}) {
	const sourceMalchus = sourceOhr || sessionTiferes.documentStore.document;
	const remixDocument = new MitzvahWorldCreatorDocument({ environment: optionsChesed.environment || globalThis });
	remixDocument.remix(sourceMalchus);
	return hydrateCreatorSession(sessionTiferes, remixDocument.document, optionsChesed);
}

function assertNearbyHydration(candidateRuntime) {
	const failuresBinah = Object.entries(candidateRuntime.diagnostics().failures);
	if (failuresBinah.length === 0) return;
	const evidenceOhr = failuresBinah
		.map(([idOhr, messageOhr]) => `${idOhr}:${messageOhr}`)
		.join('|');
	throw new Error(`CREATOR_WORLD_NEARBY_MOUNT_FAILED:${evidenceOhr}`);
}

function currentPosition(runtimeMalchus) {
	return runtimeMalchus.model?.position || runtimeMalchus.state || { x: 0, z: 0 };
}

function highestCreatorSequence(idsOros) {
	return idsOros.reduce((highest, idOhr) => {
		const match = String(idOhr).match(/-(\d+)$/);
		return Math.max(highest, Number(match?.[1] || 0));
	}, 0);
}
