// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalBatchGeometry.js
 * @description Merges the complete procedural garden into six transparent
 * material draws, many species held within one performant light of Awtsmoos.
 */
import { generateBotanicalPlant } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	botanicalPaletteKey,
	botanicalPaletteMaterial
} from './VillageBotanicalPalette.js';
import { createVillageGardenPlacements } from './VillageGardenZones.js';

/** Builds every planted species and merges its parts by a bounded palette key. */
export function createVillageBotanicalBatchDefinitions(groundSampler, quality = 'high') {
	const placements = createVillageGardenPlacements(groundSampler, quality);
	const batches = new Map();
	for (const placement of placements) {
		appendPlant(batches, generateBotanicalPlant({ ...placement, quality }));
	}
	const definitions = [...batches.values()].map(batchDefinition);
	definitions.stats = {
		...botanicalBatchStats(definitions),
		placements: placements.length,
		catalogSpecies: new Set(placements.map((item) => item.species)).size,
		quality
	};
	return definitions;
}

/** Summarizes the merged payload without reading renderer-private state. */
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
		batches.set(key, {
			key,
			vertices: [],
			faces: [],
			species: new Set(),
			partCount: 0
		});
	}
	return batches.get(key);
}

function appendGeometry(batch, geometry) {
	const offset = batch.vertices.length;
	batch.vertices.push(...geometry.vertices.map((point) => [...point]));
	batch.faces.push(...geometry.faces.map((face) => (
		face.map((index) => index + offset)
	)));
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
		alphaMode: 'MASK',
		alphaCutoff: 0.16,
		transparent: true,
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
