// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompleteBotanicalGarden.js
 * @description Merges every one of the 113 procedural species into one colored garden mesh.
 * The garden does not confuse a catalog name with a plant: each entry is generated,
 * indexed, translated, colored, and preserved in its own evidence row.
 */
import {
	generateBotanicalPlant,
	listBotanicalSpecies,
	validateBotanicalGeometry
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

export function createCompleteBotanicalGarden(options = {}) {
	const columns = Math.max(4, Math.floor(options.columns || 12));
	const spacing = positive(options.spacing, 1.35);
	const speciesIds = listBotanicalSpecies();
	const geometry = {
		colors: [],
		faces: [],
		role: 'complete-botanical-garden',
		uvs: [],
		vertices: []
	};
	const specimens = [];
	for (const [index, speciesId] of speciesIds.entries()) {
		const column = index % columns;
		const row = Math.floor(index / columns);
		const position = {
			x: (column - (columns - 1) / 2) * spacing,
			y: 0,
			z: row * spacing
		};
		const plant = generateBotanicalPlant({
			position,
			quality: options.quality || 'low',
			scale: positive(options.scale, 0.88),
			seed: Number(options.seed || 613) + index,
			species: speciesId
		});
		const validation = validateBotanicalGeometry(plant);
		if (!validation.ok) throw new Error(`${speciesId}: ${validation.issues.join(', ')}`);
		appendPlant(geometry, plant);
		specimens.push({
			index,
			position,
			speciesId,
			triangles: plant.stats.triangles,
			vertices: plant.stats.vertices
		});
	}
	return {
		geometry,
		specimens,
		stats: {
			columns,
			species: specimens.length,
			triangles: geometry.faces.length,
			vertices: geometry.vertices.length
		}
	};
}

function appendPlant(target, plant) {
	for (const part of plant.parts) {
		const offset = target.vertices.length;
		const color = hexColor(part.color);
		for (const point of part.geometry.vertices) {
			target.vertices.push([...point]);
			target.colors.push(color);
			target.uvs.push([point[0] * 0.35, point[2] * 0.35]);
		}
		for (const face of part.geometry.faces) {
			target.faces.push(face.map(index => index + offset));
		}
	}
}

function hexColor(value) {
	const hex = String(value || '#ffffff').replace('#', '');
	if (!/^[0-9a-f]{6}$/i.test(hex)) return [1, 1, 1, 1];
	return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).concat(1);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
