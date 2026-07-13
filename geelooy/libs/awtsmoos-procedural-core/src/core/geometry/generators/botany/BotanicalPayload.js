// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPayload.js
 * @description Finalizes and merges botanical material parts so many plants
 * travel through a few draw vessels, mirroring unity within the Awtsmoos.
 */
import { BotanicalGeometryBuffer } from './BotanicalGeometryBuffer.js';

export function createBotanicalBuffers() {
	return {
		green: new BotanicalGeometryBuffer(),
		bloom: new BotanicalGeometryBuffer(),
		accent: new BotanicalGeometryBuffer()
	};
}

export function botanicalPlantPayload(species, buffers, quality, seed) {
	const palette = speciesPalette(species);
	const parts = Object.entries(buffers)
		.filter(([, buffer]) => buffer.faces.length > 0)
		.map(([role, buffer]) => finalizeBotanicalPart({
			role,
			color: palette[role],
			buffer
		}));
	return {
		speciesId: species.id,
		archetype: species.archetype,
		quality,
		seed,
		parts,
		stats: summarizeBotanicalParts(parts, 1)
	};
}

export function mergeBotanicalParts(merged, parts) {
	for (const part of parts) {
		const key = `${part.role}|${part.color}`;
		if (!merged.has(key)) {
			merged.set(key, {
				role: part.role,
				color: part.color,
				buffer: new BotanicalGeometryBuffer()
			});
		}
		merged.get(key).buffer.append(part.geometry);
	}
}

export function finalizeBotanicalPart(part) {
	return {
		role: part.role,
		color: part.color,
		geometry: part.geometry || part.buffer.toGeometry()
	};
}

export function summarizeBotanicalParts(parts, instances) {
	return {
		instances,
		parts: parts.length,
		vertices: parts.reduce((sum, part) => sum + part.geometry.vertices.length, 0),
		triangles: parts.reduce((sum, part) => sum + part.geometry.faces.length, 0)
	};
}

function speciesPalette(species) {
	if (species.family === 'ground') {
		return {
			green: species.colors[0],
			bloom: species.colors[1],
			accent: species.colors[1]
		};
	}
	if (species.family === 'shrub') {
		return {
			green: species.colors[1],
			bloom: species.colors[0],
			accent: species.colors[0]
		};
	}
	return {
		green: '#39703f',
		bloom: species.colors[0],
		accent: species.colors[1]
	};
}
