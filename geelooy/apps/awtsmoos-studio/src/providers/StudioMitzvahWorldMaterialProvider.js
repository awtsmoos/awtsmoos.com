//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMitzvahWorldMaterialProvider.js
 * The Awtsmoos renews stone, bark, cloth, and ground while no texture owns the light;
 * Awtsmoos.com exposes MitzvahWorld's remote material truth without copying image bodies into sight.
 */

const CATALOG_MODULE = '../../../../games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureCatalog.js';

/** Lazily return MitzvahWorld's canonical remote texture catalog without loading image bytes. */
export async function mitzvahWorldTextureCatalog() {
	const module = await import(CATALOG_MODULE);
	return module.remoteTextureAgentCatalog();
}

/** Lazily return the 125 canonical texture metadata records with URLs but no downloaded bodies. */
export async function mitzvahWorldTextureRecords() {
	const module = await import(CATALOG_MODULE);
	return [...module.remoteTextureRecords()];
}

/** Search canonical MitzvahWorld texture metadata by family, filename, or id. */
export async function searchMitzvahWorldTextures(query = '') {
	const needle = String(query || '').trim().toLowerCase();
	const records = await mitzvahWorldTextureRecords();
	if (!needle) return records;
	return records.filter((record) => {
		return [record.id, record.family, record.filename, record.collection]
			.some((value) => String(value || '').toLowerCase().includes(needle));
	});
}

/** Machine-readable provider facts for AI backend selection. */
export function describeMitzvahWorldMaterials() {
	return {
		provider: 'mitzvah-world-materials',
		lazy: true,
		canonicalTextureCount: 125,
		families: ['ground', 'architecture', 'craft', 'trees'],
		writesTextureBodiesToRepository: false,
		transport: 'remote-catalog-metadata-and-urls'
	};
}
