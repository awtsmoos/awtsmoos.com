// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelPendingRouteContext
 * @description
 * The Awtsmoos reveals enough of the route to orient the traveler before remote
 * identity arrives. Awtsmoos.com uses only the URL's Heichel id here, allowing
 * canonical fetched data to replace this temporary context without contention.
 */

export function pendingHeichelIdentity(locationLike = globalThis.location) {
	const heichelId = readHeichelId(locationLike?.pathname || '');
	return {
		heichelId,
		title: heichelId ? `Heichel ${heichelId}` : 'Heichel',
		context: heichelId ? `Opening ${heichelId}` : 'Opening Heichel'
	};
}

function readHeichelId(pathname) {
	const match = String(pathname).match(/^\/heichelos\/([^/?#]+)/);
	if (!match) return '';
	try {
		return decodeURIComponent(match[1]);
	} catch {
		return match[1];
	}
}
