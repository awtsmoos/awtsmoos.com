// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialCatalogEnricher.mjs
 * @description Applies procedural-core semantics to generated public catalogs and writes compact AI discovery indexes.
 * Awtsmoos.com keeps one source of semantic truth while catalog files remain generated, deterministic, revalidatable evidence outside Git.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
	PUBLIC_MATERIAL_ORIGIN,
	PUBLIC_MATERIAL_SEMANTIC_SCHEMA,
	enrichPublicMaterialRecords,
	normalizePublicAssetInventory
} from './PublicMaterialCatalogSemantics.mjs';
import { buildPublicMaterialAiIndex, buildPublicMaterialTaxonomy } from './PublicMaterialAiIndex.mjs';

/** Enriches material and inventory catalogs in one public root. */
export async function enrichPublicMaterialCatalog(publicRoot) {
	const directory = path.join(publicRoot, 'catalog');
	const [materials, inventory, metadata] = await Promise.all([
		readJson(path.join(directory, 'materials.json')),
		readJson(path.join(directory, 'asset-inventory.json')),
		readJson(path.join(directory, 'import-source-metadata.json'), { entries: {} })
	]);
	const enrichedMaterials = {
		...materials,
		legacyOrigin: materials.origin || null,
		origin: PUBLIC_MATERIAL_ORIGIN,
		records: enrichPublicMaterialRecords(materials.records || [], metadata),
		semanticSchema: PUBLIC_MATERIAL_SEMANTIC_SCHEMA
	};
	const normalizedInventory = normalizePublicAssetInventory(inventory);
	const aiIndex = buildPublicMaterialAiIndex(enrichedMaterials, normalizedInventory);
	const taxonomy = buildPublicMaterialTaxonomy(aiIndex);
	await Promise.all([
		writeJson(path.join(directory, 'materials.json'), enrichedMaterials, false),
		writeJson(path.join(directory, 'asset-inventory.json'), normalizedInventory, true),
		writeJson(path.join(directory, 'material-ai-index.json'), aiIndex, true),
		writeJson(path.join(directory, 'material-taxonomy.json'), taxonomy, true)
	]);
	return Object.freeze({
		categories: Object.keys(taxonomy.categories).length,
		labels: Object.keys(taxonomy.labels).length,
		physicalRecords: enrichedMaterials.records.length,
		uniqueTextures: aiIndex.textures.length
	});
}

async function readJson(filePath, fallback) {
	try {
		return JSON.parse(await readFile(filePath, 'utf8'));
	} catch (error) {
		if (fallback !== undefined) return fallback;
		throw error;
	}
}

async function writeJson(filePath, value, readable) {
	const spacing = readable ? '\t' : undefined;
	await writeFile(filePath, `${JSON.stringify(value, null, spacing)}\n`, 'utf8');
}
