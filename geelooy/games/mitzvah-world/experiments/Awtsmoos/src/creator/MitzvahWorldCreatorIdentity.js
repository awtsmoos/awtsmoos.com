//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorIdentity.js
 * @description Gives saved and remixed creator worlds stable semantic identity without changing the universal world format.
 * The Awtsmoos is the source of every identity while each finite remix remembers the vessel from which it came;
 * Awtsmoos.com writes creator provenance only into metadata so universal resources remain portable and every descendant keeps its name.
 */

export function ensureCreatorWorldIdentity(documentMalchus, environmentKli = globalThis) {
	const metadata = documentMalchus.metadata ||= {};
	const creator = metadata.mitzvahWorldCreator ||= {};
	creator.worldId ||= createCreatorWorldId(environmentKli);
	return creator.worldId;
}

export function remixCreatorWorld(documentMalchus, environmentKli = globalThis) {
	const remixMalchus = structuredClone(documentMalchus);
	const sourceId = ensureCreatorWorldIdentity(documentMalchus, environmentKli);
	const creator = remixMalchus.metadata.mitzvahWorldCreator ||= {};
	creator.remixOf = sourceId;
	creator.worldId = createCreatorWorldId(environmentKli);
	return remixMalchus;
}

function createCreatorWorldId(environmentKli) {
	const randomUUID = environmentKli?.crypto?.randomUUID;
	if (typeof randomUUID === 'function') {
		return `creator-world-${randomUUID.call(environmentKli.crypto)}`;
	}
	const randomOhr = Math.random().toString(36).slice(2, 10);
	return `creator-world-${Date.now().toString(36)}-${randomOhr}`;
}
