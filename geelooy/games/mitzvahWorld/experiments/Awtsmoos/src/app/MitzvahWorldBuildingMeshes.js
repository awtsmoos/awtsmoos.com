// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBuildingMeshes.js
 * @description Turns every placed player structure into an honest stack of measured
 * prop definitions — boxes and cylinders with a simple material palette, sized to the
 * structure's own radius and height so nothing overhangs its collision box. The
 * definitions follow the same shape as the house shell system (id, shape, material,
 * position, size, rotation), so whatever renderer consumes static definitions can
 * paint player buildings without a second code path.
 * The Awtsmoos gives every raised beam its true measure; Awtsmoos.com draws what
 * the hands truly built.
 */

import { BUILDINGS_MUTATION_KEY, BUILDABLE_STRUCTURES } from './MitzvahWorldPlayerBuilding.js';
import { worldChunkMutation } from '../world/streaming/WorldChunkRecord.js';

/** Simple, renderer-agnostic material palette. */
const PALETTE = Object.freeze({
	wood: Object.freeze({ color: 0x8a5a33, roughness: 0.9 }),
	woodDark: Object.freeze({ color: 0x6b4226, roughness: 0.9 }),
	stone: Object.freeze({ color: 0x9a958c, roughness: 0.95 }),
	stoneDark: Object.freeze({ color: 0x6f6a61, roughness: 0.95 }),
	brass: Object.freeze({ color: 0xc9a227, roughness: 0.35, metalness: 0.7 }),
	glass: Object.freeze({ color: 0xbfe3ea, roughness: 0.15, transparent: true }),
	woolBlue: Object.freeze({ color: 0x2c4d9e, roughness: 1.0 }),
	woolPurple: Object.freeze({ color: 0x5e2c8a, roughness: 1.0 }),
	woolScarlet: Object.freeze({ color: 0xa83232, roughness: 1.0 }),
	hide: Object.freeze({ color: 0xa07a4e, roughness: 1.0 }),
	leaf: Object.freeze({ color: 0x3e7d3a, roughness: 1.0 }),
	water: Object.freeze({ color: 0x3a7ca8, roughness: 0.2, transparent: true }),
	flame: Object.freeze({ color: 0xff8c2e, roughness: 0.6, emissive: true }),
	vine: Object.freeze({ color: 0x4a7d2e, roughness: 1.0 })
});

function box(id, material, dx, dyCenter, dz, sx, sy, sz) {
	return {
		id,
		shape: 'box',
		solid: true,
		walkable: false,
		visible: true,
		noEdge: true,
		material,
		local: { x: dx, y: dyCenter, z: dz },
		size: { x: sx, y: sy, z: sz },
		rotation: { y: 0 }
	};
}

function cylinder(id, material, dx, dyCenter, dz, radius, height) {
	return {
		id,
		shape: 'cylinder',
		solid: true,
		walkable: false,
		visible: true,
		noEdge: true,
		material,
		local: { x: dx, y: dyCenter, z: dz },
		size: { radius, height },
		rotation: { y: 0 }
	};
}

/** Four posts at the corners of a square. */
function cornerPosts(prefix, material, half, postR, height, baseY = 0) {
	const pieces = [];
	const corners = [[-half, -half], [half, -half], [half, half], [-half, half]];
	corners.forEach(([dx, dz], i) => {
		pieces.push(cylinder(`${prefix}-post-${i}`, material, dx, baseY + height / 2, dz, postR, height));
	});
	return pieces;
}

const BUILDERS = {
	sukkah(s, tag) {
		const r = s.radius, h = s.height;
		const pieces = cornerPosts(tag, PALETTE.wood, r * 0.75, 0.12, h);
		pieces.push(
			box(`${tag}-beam-n`, PALETTE.woodDark, 0, h - 0.1, -r * 0.75, r * 1.6, 0.18, 0.18),
			box(`${tag}-beam-s`, PALETTE.woodDark, 0, h - 0.1, r * 0.75, r * 1.6, 0.18, 0.18),
			box(`${tag}-beam-e`, PALETTE.woodDark, r * 0.75, h - 0.1, 0, 0.18, 0.18, r * 1.6),
			box(`${tag}-beam-w`, PALETTE.woodDark, -r * 0.75, h - 0.1, 0, 0.18, 0.18, r * 1.6),
			box(`${tag}-schach`, PALETTE.leaf, 0, h + 0.12, 0, r * 1.55, 0.22, r * 1.55)
		);
		return pieces;
	},
	fence(s, tag) {
		return [
			cylinder(`${tag}-post-l`, PALETTE.wood, -s.radius * 0.7, s.height / 2, 0, 0.1, s.height),
			cylinder(`${tag}-post-r`, PALETTE.wood, s.radius * 0.7, s.height / 2, 0, 0.1, s.height),
			box(`${tag}-rail-top`, PALETTE.woodDark, 0, s.height * 0.72, 0, s.radius * 1.5, 0.12, 0.12),
			box(`${tag}-rail-low`, PALETTE.woodDark, 0, s.height * 0.38, 0, s.radius * 1.5, 0.12, 0.12)
		];
	},
	lantern(s, tag) {
		return [
			cylinder(`${tag}-post`, PALETTE.woodDark, 0, s.height * 0.4, 0, 0.09, s.height * 0.8),
			box(`${tag}-glass`, PALETTE.glass, 0, s.height * 0.82, 0, 0.44, 0.4, 0.44),
			box(`${tag}-flame`, PALETTE.flame, 0, s.height * 0.82, 0, 0.12, 0.18, 0.12),
			box(`${tag}-cap`, PALETTE.woodDark, 0, s.height + 0.05, 0, 0.6, 0.1, 0.6)
		];
	},
	bench(s, tag) {
		return [
			box(`${tag}-leg-l`, PALETTE.woodDark, -s.radius * 0.55, s.height * 0.25, 0, 0.18, s.height * 0.5, 0.5),
			box(`${tag}-leg-r`, PALETTE.woodDark, s.radius * 0.55, s.height * 0.25, 0, 0.18, s.height * 0.5, 0.5),
			box(`${tag}-seat`, PALETTE.wood, 0, s.height * 0.85, 0, s.radius * 1.5, 0.14, 0.55)
		];
	},
	well(s, tag) {
		const frameTop = s.height;
		const frameBase = 1.2;
		const postH = frameTop - frameBase;
		const postC = frameBase + postH / 2;
		return [
			cylinder(`${tag}-ring`, PALETTE.stone, 0, 0.6, 0, s.radius, 1.2),
			cylinder(`${tag}-water`, PALETTE.water, 0, 1.05, 0, s.radius * 0.7, 0.12),
			cylinder(`${tag}-post-l`, PALETTE.wood, -s.radius * 0.75, postC, 0, 0.1, postH),
			cylinder(`${tag}-post-r`, PALETTE.wood, s.radius * 0.75, postC, 0, 0.1, postH),
			box(`${tag}-crossbar`, PALETTE.woodDark, 0, frameTop - 0.15, 0, s.radius * 1.7, 0.14, 0.14)
		];
	},
	// --- Mishkan elements ---
	'mishkan-curtain'(s, tag) {
		const pieces = [
			box(`${tag}-panel-w`, PALETTE.woolBlue, 0, s.height / 2, -s.radius * 0.8, s.radius * 1.7, s.height, 0.12),
			box(`${tag}-panel-e`, PALETTE.woolPurple, 0, s.height / 2, s.radius * 0.8, s.radius * 1.7, s.height, 0.12),
			box(`${tag}-drape`, PALETTE.woolScarlet, 0, s.height + 0.06, 0, s.radius * 1.7, 0.14, s.radius * 1.7)
		];
		pieces.push(...cornerPosts(tag, PALETTE.wood, s.radius * 0.7, 0.09, s.height + 0.1));
		pieces.push(box(`${tag}-band`, PALETTE.brass, 0, s.height + 0.16, 0, s.radius * 1.74, 0.06, s.radius * 1.74));
		return pieces;
	},
	'menorah-stand'(s, tag) {
		const pieces = [
			box(`${tag}-base`, PALETTE.stoneDark, 0, 0.15, 0, 0.8, 0.3, 0.8),
			cylinder(`${tag}-stem`, PALETTE.brass, 0, s.height * 0.45, 0, 0.1, s.height * 0.85),
			box(`${tag}-bar`, PALETTE.brass, 0, s.height * 0.82, 0, s.radius * 1.6, 0.12, 0.12)
		];
		for (let i = 0; i < 7; i += 1) {
			const dx = (i - 3) * (s.radius * 1.6 / 6);
			const droop = Math.abs(i - 3) * 0.08;
			pieces.push(box(`${tag}-cup-${i}`, PALETTE.brass, dx, s.height * 0.82 + 0.12 - droop * 0.3, 0, 0.16, 0.12, 0.16));
			pieces.push(box(`${tag}-flame-${i}`, PALETTE.flame, dx, s.height * 0.82 + 0.28 - droop * 0.3, 0, 0.08, 0.14, 0.08));
		}
		return pieces;
	},
	shulchan(s, tag) {
		const h = s.height;
		return [
			...cornerPosts(tag, PALETTE.woodDark, s.radius * 0.6, 0.09, h * 0.72),
			box(`${tag}-top`, PALETTE.wood, 0, h * 0.8, 0, s.radius * 1.6, 0.14, s.radius * 1.3),
			box(`${tag}-rim`, PALETTE.brass, 0, h * 0.88, 0, s.radius * 1.66, 0.05, s.radius * 1.36),
			box(`${tag}-bread-1`, PALETTE.woolScarlet, -s.radius * 0.35, h * 0.98, 0, 0.3, 0.1, 0.4),
			box(`${tag}-bread-2`, PALETTE.woolScarlet, s.radius * 0.35, h * 0.98, 0, 0.3, 0.1, 0.4)
		];
	},
	mizbeach(s, tag) {
		const pieces = [
			box(`${tag}-base`, PALETTE.stoneDark, 0, 0.25, 0, s.radius * 1.8, 0.5, s.radius * 1.8),
			box(`${tag}-body`, PALETTE.stone, 0, 0.5 + (s.height - 1.0) / 2, 0, s.radius * 1.5, s.height - 1.0, s.radius * 1.5),
			box(`${tag}-top`, PALETTE.brass, 0, s.height - 0.1, 0, s.radius * 1.6, 0.2, s.radius * 1.6)
		];
		const horn = s.radius * 0.7;
		for (const [dx, dz] of [[-horn, -horn], [horn, -horn], [horn, horn], [-horn, horn]]) {
			pieces.push(box(`${tag}-horn-${dx > 0 ? 'e' : 'w'}${dz > 0 ? 's' : 'n'}`, PALETTE.brass, dx, s.height + 0.12, dz, 0.22, 0.3, 0.22));
		}
		return pieces;
	},
	kiyor(s, tag) {
		return [
			cylinder(`${tag}-pedestal`, PALETTE.brass, 0, 0.35, 0, 0.35, 0.7),
			cylinder(`${tag}-basin`, PALETTE.brass, 0, s.height * 0.72, 0, s.radius * 0.95, s.height * 0.45),
			cylinder(`${tag}-water`, PALETTE.water, 0, s.height * 0.9, 0, s.radius * 0.8, 0.08)
		];
	},
	// --- Patriarchal ---
	'avraham-tent'(s, tag) {
		return [
			cylinder(`${tag}-pole`, PALETTE.wood, 0, s.height / 2, 0, 0.14, s.height),
			...cornerPosts(tag, PALETTE.wood, s.radius * 0.7, 0.1, s.height * 0.62),
			box(`${tag}-roof`, PALETTE.hide, 0, s.height + 0.08, 0, s.radius * 1.8, 0.16, s.radius * 1.8),
			box(`${tag}-flap-l`, PALETTE.hide, -s.radius * 0.45, s.height * 0.32, s.radius * 0.78, 0.7, s.height * 0.6, 0.08),
			box(`${tag}-flap-r`, PALETTE.hide, s.radius * 0.45, s.height * 0.32, s.radius * 0.78, 0.7, s.height * 0.6, 0.08)
		];
	},
	'yitzchak-well'(s, tag) {
		const frameTop = s.height;
		const frameBase = 1.3;
		const postH = frameTop - frameBase;
		const postC = frameBase + postH / 2;
		return [
			cylinder(`${tag}-ring-low`, PALETTE.stoneDark, 0, 0.4, 0, s.radius, 0.8),
			cylinder(`${tag}-ring-high`, PALETTE.stone, 0, 1.0, 0, s.radius * 0.92, 0.6),
			cylinder(`${tag}-water`, PALETTE.water, 0, 1.2, 0, s.radius * 0.65, 0.1),
			cylinder(`${tag}-post-l`, PALETTE.wood, -s.radius * 0.8, postC, 0, 0.1, postH),
			cylinder(`${tag}-post-r`, PALETTE.wood, s.radius * 0.8, postC, 0, 0.1, postH),
			box(`${tag}-axle`, PALETTE.woodDark, 0, frameTop - 0.2, 0, s.radius * 1.8, 0.14, 0.14),
			box(`${tag}-bucket`, PALETTE.wood, 0, frameTop - 0.55, 0, 0.3, 0.28, 0.3)
		];
	},
	'mizbeach-evanim'(s, tag) {
		const pieces = [
			box(`${tag}-slab-low`, PALETTE.stoneDark, 0, 0.2, 0, s.radius * 1.7, 0.4, s.radius * 1.7),
			box(`${tag}-slab-mid`, PALETTE.stone, 0, 0.58, 0, s.radius * 1.4, 0.36, s.radius * 1.4),
			box(`${tag}-slab-top`, PALETTE.stoneDark, 0, s.height - 0.16, 0, s.radius * 1.1, 0.32, s.radius * 1.1)
		];
		const off = s.radius * 0.62;
		for (const [dx, dz] of [[-off, -off], [off, -off], [off, off], [-off, off]]) {
			pieces.push(box(`${tag}-stone-${dx > 0 ? 'e' : 'w'}${dz > 0 ? 's' : 'n'}`, PALETTE.stone, dx, 0.45, dz, 0.4, 0.9, 0.4));
		}
		return pieces;
	},
	// --- Village ---
	watchtower(s, tag) {
		const h = s.height;
		return [
			...cornerPosts(tag, PALETTE.woodDark, s.radius * 0.7, 0.14, h * 0.8),
			box(`${tag}-brace-n`, PALETTE.wood, 0, h * 0.4, -s.radius * 0.7, s.radius * 1.6, 0.14, 0.14),
			box(`${tag}-brace-s`, PALETTE.wood, 0, h * 0.4, s.radius * 0.7, s.radius * 1.6, 0.14, 0.14),
			box(`${tag}-platform`, PALETTE.wood, 0, h * 0.82, 0, s.radius * 1.7, 0.16, s.radius * 1.7),
			box(`${tag}-rail-n`, PALETTE.woodDark, 0, h * 0.92, -s.radius * 0.8, s.radius * 1.7, 0.08, 0.08),
			box(`${tag}-rail-s`, PALETTE.woodDark, 0, h * 0.92, s.radius * 0.8, s.radius * 1.7, 0.08, 0.08),
			box(`${tag}-rail-e`, PALETTE.woodDark, s.radius * 0.8, h * 0.92, 0, 0.08, 0.08, s.radius * 1.7),
			box(`${tag}-rail-w`, PALETTE.woodDark, -s.radius * 0.8, h * 0.92, 0, 0.08, 0.08, s.radius * 1.7),
			box(`${tag}-roof`, PALETTE.hide, 0, h + 0.02, 0, s.radius * 1.9, 0.14, s.radius * 1.9)
		];
	},
	granary(s, tag) {
		return [
			...cornerPosts(tag, PALETTE.stoneDark, s.radius * 0.7, 0.16, 0.7),
			box(`${tag}-body`, PALETTE.wood, 0, 0.7 + s.height * 0.28, 0, s.radius * 1.7, s.height * 0.56, s.radius * 1.7),
			box(`${tag}-band`, PALETTE.woodDark, 0, 0.7 + s.height * 0.42, 0, s.radius * 1.74, 0.1, s.radius * 1.74),
			box(`${tag}-roof-l`, PALETTE.hide, -s.radius * 0.45, s.height + 0.05, 0, s.radius * 1.0, 0.12, s.radius * 1.9),
			box(`${tag}-roof-r`, PALETTE.hide, s.radius * 0.45, s.height + 0.05, 0, s.radius * 1.0, 0.12, s.radius * 1.9)
		];
	},
	'olive-press'(s, tag) {
		return [
			cylinder(`${tag}-basin`, PALETTE.stoneDark, 0, 0.3, 0, s.radius * 0.95, 0.6),
			cylinder(`${tag}-oil`, PALETTE.woolScarlet, 0, 0.55, 0, s.radius * 0.6, 0.08),
			cylinder(`${tag}-wheel`, PALETTE.stone, -s.radius * 0.5, s.height * 0.5, 0, s.radius * 0.45, 0.3),
			box(`${tag}-beam`, PALETTE.woodDark, 0, s.height * 0.85, 0, s.radius * 1.7, 0.18, 0.18),
			cylinder(`${tag}-post-l`, PALETTE.wood, -s.radius * 0.75, s.height * 0.45, 0, 0.11, s.height * 0.9),
			cylinder(`${tag}-post-r`, PALETTE.wood, s.radius * 0.75, s.height * 0.45, 0, 0.11, s.height * 0.9)
		];
	},
	'vineyard-trellis'(s, tag) {
		const pieces = [];
		const posts = [-s.radius * 0.75, -s.radius * 0.25, s.radius * 0.25, s.radius * 0.75];
		posts.forEach((dx, i) => {
			pieces.push(cylinder(`${tag}-post-${i}`, PALETTE.wood, dx, s.height * 0.45, 0, 0.09, s.height * 0.9));
			pieces.push(box(`${tag}-vine-${i}`, PALETTE.vine, dx, s.height * 0.7, 0, 0.22, s.height * 0.35, 0.22));
		});
		pieces.push(
			box(`${tag}-bar-top`, PALETTE.woodDark, 0, s.height * 0.88, 0, s.radius * 1.6, 0.1, 0.1),
			box(`${tag}-bar-mid`, PALETTE.woodDark, 0, s.height * 0.55, 0, s.radius * 1.6, 0.1, 0.1)
		);
		return pieces;
	},
	'sheepfold-gate'(s, tag) {
		return [
			box(`${tag}-pier-l`, PALETTE.stone, -s.radius * 0.8, s.height / 2, 0, 0.5, s.height, 0.6),
			box(`${tag}-pier-r`, PALETTE.stone, s.radius * 0.8, s.height / 2, 0, 0.5, s.height, 0.6),
			box(`${tag}-bar`, PALETTE.woodDark, 0, s.height * 0.8, 0, s.radius * 1.4, 0.14, 0.14),
			box(`${tag}-bar-low`, PALETTE.woodDark, 0, s.height * 0.45, 0, s.radius * 1.4, 0.14, 0.14),
			box(`${tag}-wall-l`, PALETTE.stoneDark, -s.radius * 0.95, s.height * 0.3, 0, 0.3, s.height * 0.6, 0.9),
			box(`${tag}-wall-r`, PALETTE.stoneDark, s.radius * 0.95, s.height * 0.3, 0, 0.3, s.height * 0.6, 0.9)
		];
	},
	'mikveh-pool'(s, tag) {
		return [
			box(`${tag}-rim-n`, PALETTE.stone, 0, 0.3, -s.radius * 0.85, s.radius * 1.8, 0.6, 0.25),
			box(`${tag}-rim-s`, PALETTE.stone, 0, 0.3, s.radius * 0.85, s.radius * 1.8, 0.6, 0.25),
			box(`${tag}-rim-e`, PALETTE.stone, s.radius * 0.85, 0.3, 0, 0.25, 0.6, s.radius * 1.45),
			box(`${tag}-rim-w`, PALETTE.stone, -s.radius * 0.85, 0.3, 0, 0.25, 0.6, s.radius * 1.45),
			box(`${tag}-floor`, PALETTE.stoneDark, 0, 0.08, 0, s.radius * 1.7, 0.16, s.radius * 1.7),
			cylinder(`${tag}-water`, PALETTE.water, 0, 0.42, 0, s.radius * 0.72, 0.35),
			box(`${tag}-step-1`, PALETTE.stoneDark, -s.radius * 0.5, 0.22, s.radius * 0.35, 0.6, 0.12, 0.4),
			box(`${tag}-step-2`, PALETTE.stoneDark, -s.radius * 0.5, 0.36, s.radius * 0.15, 0.6, 0.12, 0.4)
		];
	}
};

const DEFAULT_BUILDER = (s, tag) => [
	box(`${tag}-core`, PALETTE.wood, 0, s.height / 2, 0, s.radius * 1.2, s.height, s.radius * 1.2)
];

/**
 * Builds renderer-agnostic mesh definitions for one placed structure.
 * Each piece carries world-space `position`; the definition id is unique per
 * structure instance.
 */
export function buildStructureMeshes(structure) {
	const tag = structure.id || 'structure';
	const builder = BUILDERS[structure.structureId] || DEFAULT_BUILDER;
	const pieces = builder(structure, tag);
	return pieces.map(piece => ({
		...piece,
		id: `${tag}-${piece.id.split(`${tag}-`).pop()}`,
		position: {
			x: structure.x + piece.local.x,
			y: structure.y + piece.local.y,
			z: structure.z + piece.local.z
		}
	}));
}

/** Counts the mesh pieces one structure of this id would draw. */
export function meshPieceCount(structureId) {
	const definition = BUILDABLE_STRUCTURES[structureId];
	if (!definition) return 0;
	const builder = BUILDERS[definition.id] || DEFAULT_BUILDER;
	return builder({ radius: definition.radius, height: definition.height }, 'probe').length;
}

/** Builds mesh definitions for every player structure stored in a chunk record. */
export function meshesForChunkRecord(record) {
	const list = worldChunkMutation(record, BUILDINGS_MUTATION_KEY);
	if (!Array.isArray(list)) return [];
	return list.flatMap(structure => buildStructureMeshes(structure));
}

/** Every buildable structure id that has a hand-tuned mesh builder. */
export function meshedStructureIds() {
	return Object.keys(BUILDERS);
}
