// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDrivePbrFamilies.js
 * @description Reassembles unique remote images into searchable PBR material families while retaining every quality variant and alias.
 * The Awtsmoos joins many finite maps into one visible garment; Awtsmoos.com lets renderers receive one coherent stone, bark, or timber family rather than unrelated image names.
 */

/** @param {object} library Compiled texture library. @returns {object} PBR family catalog. */
export function compileAwtsmoosDrivePbrFamilies(library) {
	const groups = new Map();
	for (const texture of library?.textures || []) {
		const key = texture.pbrFamily || texture.id;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(texture);
	}
	const families = [...groups.entries()].map(([id, textures]) => family(id, textures)).sort((a, b) => a.id.localeCompare(b.id));
	return Object.freeze({
		evidence: Object.freeze({ families: families.length, textures: library?.textures?.length || 0 }),
		families: Object.freeze(families)
	});
}

/** Searches complete material families without loading image bytes. */
export function searchAwtsmoosDrivePbrFamilies(catalog, query = '', options = {}) {
	const needle = normalize(query);
	return Object.freeze((catalog?.families || []).filter(item => {
		if (options.category && item.category !== options.category) return false;
		if (options.subcategory && item.subcategory !== options.subcategory) return false;
		if (options.requireChannels?.some(channel => !item.channels[channel])) return false;
		return !needle || item.searchText.includes(needle);
	}));
}

function family(id, textures) {
	const color = textures.find(texture => texture.channel === 'albedo') || textures[0];
	const channels = {};
	for (const texture of textures) channels[texture.channel] ||= texture;
	const tags = unique(textures.flatMap(texture => texture.tags || []));
	return Object.freeze({
		category: color.category,
		channels: Object.freeze(channels),
		id,
		name: color.name,
		searchText: normalize([color.name, color.path, color.category, color.subcategory, ...tags, ...textures.flatMap(texture => texture.aliases || [])].join(' ')),
		subcategory: color.subcategory,
		tags: Object.freeze(tags)
	});
}

function unique(values) { return [...new Set(values.filter(Boolean))]; }
function normalize(value) { return String(value || '').trim().toLowerCase(); }
