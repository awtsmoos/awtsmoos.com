// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalBatchAssembler.js
 * @description Joins thousands of botanical triangles into six material vessels.
 * The garden keeps its many species while draw calls rest in the unity of Awtsmoos.
 */
import { botanicalPaletteKey, botanicalPaletteMaterial } from '../village/VillageBotanicalPalette.js';

/** Merges generated plants into renderer-ready palette definitions. */
export function assembleVillageBotanicalBatches(plants) {
	const batches = new Map();
	for (const plant of plants) appendPlant(batches, plant);
	return [...batches.values()].map(batchDefinition);
}

/** Summarizes merged botanical geometry without renderer inspection. */
export function botanicalBatchStats(definitions) {
	return definitions.reduce((summary, definition) => ({
		batches: summary.batches + 1,
		vertices: summary.vertices + definition.vertices.length,
		triangles: summary.triangles + definition.faces.length,
		species: summary.species + definition.userData.speciesCount
	}), { batches: 0, vertices: 0, triangles: 0, species: 0 });
}

function appendPlant(batches, plant) {
	for (const part of plant.parts) {
		const key = botanicalPaletteKey(part);
		const batch = ensureBatch(batches, key);
		appendGeometry(batch, part.geometry);
		batch.species.add(plant.speciesId);
		batch.partCount += 1;
	}
}

function ensureBatch(batches, key) {
	if (!batches.has(key)) {
		batches.set(key, { key, vertices: [], faces: [], species: new Set(), partCount: 0 });
	}
	return batches.get(key);
}

function appendGeometry(batch, geometry) {
	const offset = batch.vertices.length;
	batch.vertices.push(...geometry.vertices.map((point) => [...point]));
	batch.faces.push(...geometry.faces.map((face) => face.map((index) => index + offset)));
}

function batchDefinition(batch) {
	const material = botanicalPaletteMaterial(batch.key);
	return {
		id: `Awtsmoos_botanical_batch_${batch.key}`,
		shape: 'manual',
		vertices: batch.vertices,
		faces: batch.faces,
		color: material.color,
		textureUrl: material.textureUrl,
		mapRepeat: material.mapRepeat,
		alphaMode: material.alphaMode,
		alphaCutoff: 0.16,
		transparent: material.transparent,
		doubleSided: true,
		backfaceCull: false,
		solid: false,
		noEdge: true,
		userData: {
			staticBatch: true,
			family: 'village-botanical-garden',
			palette: batch.key,
			speciesCount: batch.species.size,
			partCount: batch.partCount,
			AwtsmoosLod: { className: 'vegetation' }
		},
		texturePolicy: {
			role: material.role,
			publicFirebase: true,
			realMaterialRequired: true,
			alpha: 'transparent-cutout-required',
			shader: material.shader
		}
	};
}
