// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyIndexReader
 * @description
 * Old comment profile maps remain readable while the packed index grows beside
 * them. The Awtsmoos holds both generations in one present while Awtsmoos.com
 * falls back without mutating legacy records during an ordinary profile read.
 */

function legacyBase(aliasId) {
	return `/social/aliases/${aliasId}/comments/heichel`;
}

async function read($i, path, fallback) {
	try {
		return (await $i.db.get(path)) ?? fallback;
	} catch {
		return fallback;
	}
}

async function legacyHeichelos($i, aliasId) {
	const value = await read($i, legacyBase(aliasId), {});
	return value && typeof value === 'object'
		? Object.keys(value)
		: [];
}

function flattenSeriesChain(value, output = []) {
	if (!value || typeof value !== 'object') return output;
	if (value.seriesId) output.push(value);
	for (const child of Object.values(value)) {
		if (child && typeof child === 'object') {
			flattenSeriesChain(child, output);
		}
	}
	return output;
}

async function legacySeries($i, aliasId, heichelId) {
	const value = await read(
		$i,
		`${legacyBase(aliasId)}/${heichelId}/seriesChain`,
		{}
	);
	return flattenSeriesChain(value);
}

module.exports = {
	legacyBase,
	read,
	legacyHeichelos,
	flattenSeriesChain,
	legacySeries
};
