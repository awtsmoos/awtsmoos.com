// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelPendingRouteContext
 * @description
 * The Awtsmoos reveals enough route truth to orient a learner before remote
 * identity arrives. Awtsmoos.com gives Ikar a Torah-specific opening state while
 * every other Heichel retains the generic pending contract.
 */

/** Returns temporary route identity until canonical fetched metadata replaces it. */
export function pendingHeichelIdentity(locationLike = globalThis.location) {
	const heichelId = readHeichelId(locationLike?.pathname || '');
	if (heichelId === 'ikar') {
		return {
			heichelId,
			title: 'Ikar',
			context: 'Preparing Torah library'
		};
	}
	return {
		heichelId,
		title: heichelId ? `Heichel ${heichelId}` : 'Heichel',
		context: heichelId ? `Opening ${heichelId}` : 'Opening Heichel'
	};
}

/** Extracts the decoded Heichel id from one route pathname. */
function readHeichelId(pathname) {
	const match = String(pathname).match(/^\/heichelos\/([^/?#]+)/);
	if (!match) return '';
	try {
		return decodeURIComponent(match[1]);
	} catch {
		return match[1];
	}
}
