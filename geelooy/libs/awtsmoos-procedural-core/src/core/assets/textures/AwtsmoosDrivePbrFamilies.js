// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDrivePbrFamilies.js
 * @description Reassembles unique remote images into searchable PBR families while preserving every semantic label, category, quality variant, and alias.
 * Awtsmoos.com lets renderers receive coherent material channels and lets AI find a family through any truthful overlapping description.
 */

/** Compiles complete material families without loading image bytes. */
export function compileAwtsmoosDrivePbrFamilies(library) {
	const groups = new Map();
	for (const texture of library?.textures || []) {
		const key = texture.pbrFamily || texture.id;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(texture);
	}
	const families = [...groups.entries()]
		.map(([id, textures]) => family(id, textures))
		.sort((left, right) => left.id.localeCompare(right.id));
	return Object.freeze({
		evidence: Object.freeze({ families: families.length, textures: library?.textures?.length || 0 }),
		families: Object.freeze(families)
	});
}

/** Searches complete material families with overlapping semantic filters. */
export function searchAwtsmoosDrivePbrFamilies(catalog, query = '', options = {}) {
	const needle = normalize(query);
	return Object.freeze((catalog?.families || []).filter(item => {
		if (options.category && !item.categories.includes(options.category)) return false;
		if (options.subcategory && !item.subcategories.includes(options.subcategory)) return false;
		if (options.categories?.some(value => !item.categories.includes(value))) return false;
		if (options.labels?.some(value => !item.labels.includes(value))) return false;
		if (options.requireChannels?.some(channel => !item.channels[channel])) return false;
		return !needle || item.searchText.includes(needle);
	}));
}

function family(id, textures) {
	const color = textures.find(texture => texture.channel === 'albedo') || textures[0];
	const channels = {};
	for (const texture of textures) channels[texture.channel] ||= texture;
	const categories = unique(textures.flatMap(texture => texture.categories || []));
	const subcategories = unique(textures.flatMap(texture => texture.subcategories || []));
	const labels = unique(textures.flatMap(texture => texture.labels || []));
	const tags = unique(textures.flatMap(texture => texture.tags || []));
	return Object.freeze({
		categories: Object.freeze(categories),
		category: color.category,
		channels: Object.freeze(channels),
		id,
		labels: Object.freeze(labels),
		name: color.name,
		searchText: normalize([color.name, color.path, ...categories, ...subcategories, ...labels, ...tags, ...textures.flatMap(texture => texture.aliases || [])].join(' ')),
		subcategories: Object.freeze(subcategories),
		subcategory: color.subcategory,
		tags: Object.freeze(tags)
	});
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

function normalize(value) {
	return String(value || '').trim().toLowerCase();
}
