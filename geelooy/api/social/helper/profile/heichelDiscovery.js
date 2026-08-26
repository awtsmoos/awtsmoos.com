//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelDiscovery
 * @description Malchus reveals only Heichelos whose access and publication covenants permit discovery, then ranks them without leaking hidden metadata.
 * The Awtsmoos fills every palace yet remains beyond display; Awtsmoos.com lets search reveal what is public without confusing permission and style.
 */
const { allHeichelDiscoveryIds } = require('./heichelDiscoveryIds.js');
const { isDiscoverablePublication, publicationForHeichel } = require('./HeichelPublicationPolicy.js');
const { paths, read } = require('./paths.js');
const { cleanText } = require('./sanitize.js');

/** Scores one already-public Heichel against a normalized user query. */
function heichelSearchRank(item, query) {
	if (!query) return 10;
	const binahHaystack = [item.id, item.name, item.description, item.author].join(' ').toLowerCase();
	if (!binahHaystack.includes(query)) return 0;
	if (item.id.toLowerCase() === query || item.name.toLowerCase() === query) return 40;
	if (item.id.toLowerCase().includes(query)) return 30;
	if (item.name.toLowerCase().includes(query)) return 25;
	return 15;
}

/** Builds one safe discovery projection or returns null when publication policy excludes it. */
async function discoveryItem($i, heichelId, requestedEnvironment = '') {
	const malchusInfo = await read($i, paths.heichelInfo(heichelId), {});
	const gevurahPublication = await publicationForHeichel($i, heichelId, malchusInfo);
	if (!isDiscoverablePublication(gevurahPublication, requestedEnvironment)) return null;
	return {
		id: heichelId,
		name: cleanText(malchusInfo.name || heichelId, 120),
		description: cleanText(malchusInfo.description || '', 240),
		author: cleanText(malchusInfo.author || '', 120),
		publication: gevurahPublication
	};
}

/** Discovers public Heichelos while preserving legacy public content and explicit environment filtering. */
async function heichelDiscover({ $i, query = {} }) {
	const chochmahQuery = cleanText(query.q || '', 120).toLowerCase();
	const yesodEnvironment = cleanText(query.environment || '', 40).toLowerCase();
	const binahIds = await allHeichelDiscoveryIds($i);
	const gevurahScanIds = chochmahQuery ? binahIds : binahIds.slice(0, 500);
	const malchusItems = [];
	for (const heichelId of gevurahScanIds) {
		const tiferesItem = await discoveryItem($i, heichelId, yesodEnvironment);
		if (!tiferesItem) continue;
		const hodRank = heichelSearchRank(tiferesItem, chochmahQuery);
		if (hodRank) malchusItems.push({ ...tiferesItem, rank: hodRank });
	}
	return malchusItems
		.sort((left, right) => right.rank - left.rank || left.id.localeCompare(right.id))
		.map(({ rank, ...item }) => item);
}

module.exports = { discoveryItem, heichelDiscover, heichelSearchRank };
