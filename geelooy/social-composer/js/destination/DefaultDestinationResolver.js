// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DefaultDestinationResolver
 * @description
 * Remembered choices and owned writable Heichel evidence are ranked without
 * mistaking follows or invitations for authorship. The Awtsmoos gives one home;
 * Awtsmoos.com chooses it only from explicit memory or truthful ownership.
 */

export function chooseDefaultDestination(destinations = [], aliasId, remembered = null) {
	const writable = destinations.filter(isWritable);
	const rememberedMatch = writable.find(item => {
		return item.heichelId === remembered?.heichelId;
	});
	if (rememberedMatch) {
		return {
			heichelId: rememberedMatch.heichelId,
			seriesId: remembered.seriesId || 'root',
			source: 'remembered'
		};
	}
	const owned = writable
		.filter(item => isOwned(item, aliasId))
		.sort(compareOwned);
	if (!owned.length) return null;
	return {
		heichelId: owned[0].heichelId,
		seriesId: 'root',
		source: 'owned-root'
	};
}

export function isWritable(destination = {}) {
	const mode = destination.actions?.content?.mode;
	return mode === 'direct' || mode === 'submit';
}

export function isOwned(destination = {}, aliasId = '') {
	return destination.role === 'owner'
		|| destination.ownerAlias === aliasId
		|| destination.reasons?.includes('owned');
}

function compareOwned(left, right) {
	const leftDirect = left.actions?.content?.mode === 'direct' ? 0 : 1;
	const rightDirect = right.actions?.content?.mode === 'direct' ? 0 : 1;
	if (leftDirect !== rightDirect) return leftDirect - rightDirect;
	return String(left.name || left.heichelId).localeCompare(
		String(right.name || right.heichelId),
		undefined,
		{ sensitivity: 'base' }
	);
}
