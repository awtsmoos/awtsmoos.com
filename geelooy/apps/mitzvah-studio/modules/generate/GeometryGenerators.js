// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeometryGenerators.js
 * @description Turns a Generate build spec into studio-ready composite objects.
 * Chochmah offers raw possibility; Binah measures body, roof, trunk, and canopy into
 * a kit of parts the Studio can place; Malchus receives them through state.add.
 * Every build is seeded: the same seed grows the same world, every time.
 */

import {
	generatePrimitiveGeometry
} from '../../../../libs/awtsmoos-procedural-core/src/core/geometry/primitiveGeometryGenerator.js';
import {
	GENERATE_CATEGORIES
} from './PromptInterpreter.js';

/**
 * Deterministic seedable PRNG so one seed always grows one arrangement.
 * @param {number} seed Integer seed.
 * @returns {Function} Function returning a float in [0, 1).
 */
export function mulberry32(seed) {
	let a = seed >>> 0;
	return function () {
		a |= 0;
		a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const PALETTES = Object.freeze({
	'meadow': Object.freeze({
		wall: '#a97e4f',
		wood: '#8d6a45',
		woodDark: '#6b4e30',
		leaf: '#4f8f3a',
		leafDark: '#3a6e2c',
		stone: '#9a9a92',
		water: '#4fa3d8',
		roof: '#7c4a2d',
		accent: '#d8b25c',
		glass: '#bfe3ec'
	}),
	'old-city': Object.freeze({
		wall: '#e3d3ae',
		wood: '#7a5a38',
		woodDark: '#5d4429',
		leaf: '#5d8a43',
		leafDark: '#456b31',
		stone: '#cfc39f',
		water: '#5aa8d0',
		roof: '#a4552f',
		accent: '#2f6f8f',
		glass: '#cfe8ef'
	}),
	'modern': Object.freeze({
		wall: '#c9d2d8',
		wood: '#9aa2a8',
		woodDark: '#6e747a',
		leaf: '#6aa84f',
		leafDark: '#4f8039',
		stone: '#b9c0c6',
		water: '#4f9fd8',
		roof: '#5a6268',
		accent: '#3d6fb4',
		glass: '#8ed8e8'
	})
});

const SIZE_MULTIPLIERS = Object.freeze({
	small: { x: 0.7, y: 0.7, z: 0.7 },
	medium: { x: 1, y: 1, z: 1 },
	large: { x: 1.35, y: 1.35, z: 1.35 },
	wide: { x: 1.5, y: 1, z: 0.85 }
});

/**
 * @param {number} x Width.
 * @param {number} y Height.
 * @param {number} z Depth.
 * @param {{x:number,y:number,z:number}} m Multiplier.
 * @returns {{x:number,y:number,z:number}} Scaled size rounded to two decimals.
 */
function scaledSize(x, y, z, m) {
	const round = value => Math.round(value * 100) / 100;
	return { x: round(x * m.x), y: round(y * m.y), z: round(z * m.z) };
}

/**
 * Creates one composite piece: a primitive with a center offset and rotation.
 * Offsets are relative to the build origin on the ground; rotations are radians.
 * @returns {object} Piece record for preview drawing and studio placement.
 */
function piece(name, shape, size, color, materialRole, offset, rotation) {
	return {
		name,
		shape,
		size: { x: size.x, y: size.y, z: size.z },
		color,
		materialRole,
		offset: { x: offset.x, y: offset.y, z: offset.z },
		rotation: { x: rotation?.x || 0, y: rotation?.y || 0, z: rotation?.z || 0 }
	};
}

/** @returns {object} Center offset shorthand. */
function at(x, y, z) {
	return { x, y, z };
}

function jitter(rng, amount) {
	return (rng() * 2 - 1) * amount;
}

/* ---------------- composite builders: (rng, palette, sizeMultiplier) -> pieces[] ---------------- */

function buildHouse(rng, P, m) {
	const bodyH = 2.6 * m.y;
	return [
		piece('walls', 'box', scaledSize(4, 2.6, 3.4, m), P.wall, 'wall', at(0, bodyH / 2, 0)),
		piece('roof', 'box', scaledSize(4.7, 1.5, 2.9, m), P.roof, 'roof', at(0, bodyH + 0.35 * m.y, 0), { x: Math.PI / 4 }),
		piece('door', 'box', scaledSize(0.9, 1.6, 0.14, m), P.woodDark, 'door', at(0, 0.8 * m.y, 1.7 * m.z + 0.03)),
		piece('window left', 'box', scaledSize(0.85, 0.85, 0.12, m), P.glass, 'window', at(-1.25 * m.x, 1.55 * m.y, 1.7 * m.z + 0.02)),
		piece('window right', 'box', scaledSize(0.85, 0.85, 0.12, m), P.glass, 'window', at(1.25 * m.x, 1.55 * m.y, 1.7 * m.z + 0.02)),
		piece('chimney', 'box', scaledSize(0.5, 1.3, 0.5, m), P.stone, 'chimney', at(1.2 * m.x, bodyH + 0.9 * m.y, -0.6 * m.z))
	];
}

function buildShul(rng, P, m) {
	const parts = buildHouse(rng, P, m);
	const bodyH = 2.6 * m.y;
	parts.push(
		piece('dome', 'sphere', scaledSize(2.4, 1.8, 2.4, m), P.accent, 'dome', at(0, bodyH + 1.5 * m.y, 0)),
		piece('plaque', 'box', scaledSize(1.7, 0.55, 0.12, m), P.accent, 'sign', at(0, 2.35 * m.y, 1.7 * m.z + 0.04))
	);
	return parts;
}

function buildShop(rng, P, m) {
	const bodyH = 2.8 * m.y;
	return [
		piece('walls', 'box', scaledSize(5, 2.8, 3.6, m), P.wall, 'wall', at(0, bodyH / 2, 0)),
		piece('roof', 'box', scaledSize(5.6, 1.4, 3, m), P.roof, 'roof', at(0, bodyH + 0.32 * m.y, 0), { x: Math.PI / 4 }),
		piece('storefront', 'box', scaledSize(3.4, 1.6, 0.12, m), P.glass, 'window', at(-0.4 * m.x, 1.35 * m.y, 1.8 * m.z + 0.02)),
		piece('door', 'box', scaledSize(0.95, 1.9, 0.14, m), P.woodDark, 'door', at(1.9 * m.x, 0.95 * m.y, 1.8 * m.z + 0.03)),
		piece('awning', 'box', scaledSize(3.9, 0.14, 1.3, m), P.accent, 'awning', at(-0.4 * m.x, 2.45 * m.y, 1.8 * m.z + 0.55 * m.z), { x: -0.32 })
	];
}

function buildSchool(rng, P, m) {
	const bodyH = 3 * m.y;
	return [
		piece('walls', 'box', scaledSize(7, 3, 4, m), P.wall, 'wall', at(0, bodyH / 2, 0)),
		piece('roof', 'box', scaledSize(7.6, 1.6, 3.1, m), P.roof, 'roof', at(0, bodyH + 0.36 * m.y, 0), { x: Math.PI / 4 }),
		piece('door left', 'box', scaledSize(0.85, 1.9, 0.14, m), P.woodDark, 'door', at(-0.5 * m.x, 0.95 * m.y, 2 * m.z + 0.03)),
		piece('door right', 'box', scaledSize(0.85, 1.9, 0.14, m), P.woodDark, 'door', at(0.5 * m.x, 0.95 * m.y, 2 * m.z + 0.03)),
		piece('sign', 'box', scaledSize(2.6, 0.6, 0.12, m), P.accent, 'sign', at(0, 2.5 * m.y, 2 * m.z + 0.04)),
		piece('window left', 'box', scaledSize(1, 1, 0.12, m), P.glass, 'window', at(-2.4 * m.x, 1.7 * m.y, 2 * m.z + 0.02)),
		piece('window right', 'box', scaledSize(1, 1, 0.12, m), P.glass, 'window', at(2.4 * m.x, 1.7 * m.y, 2 * m.z + 0.02))
	];
}

function buildTower(rng, P, m) {
	const shaftH = 6 * m.y;
	return [
		piece('shaft', 'box', scaledSize(2.2, 6, 2.2, m), P.wall, 'wall', at(0, shaftH / 2, 0)),
		piece('cap', 'box', scaledSize(2.9, 0.55, 2.9, m), P.roof, 'roof', at(0, shaftH + 0.27 * m.y, 0)),
		piece('crown', 'box', scaledSize(1.2, 0.9, 1.2, m), P.accent, 'crown', at(0, shaftH + 0.95 * m.y, 0)),
		piece('window high', 'box', scaledSize(0.7, 0.9, 0.12, m), P.glass, 'window', at(0, 4.6 * m.y, 1.1 * m.z + 0.02)),
		piece('window mid', 'box', scaledSize(0.7, 0.9, 0.12, m), P.glass, 'window', at(0, 3 * m.y, 1.1 * m.z + 0.02)),
		piece('door', 'box', scaledSize(0.9, 1.6, 0.14, m), P.woodDark, 'door', at(0, 0.8 * m.y, 1.1 * m.z + 0.03))
	];
}

function buildHall(rng, P, m) {
	return buildHouse(rng, P, { x: m.x * 1.4, y: m.y * 1.1, z: m.z * 1.2 });
}

function buildTree(rng, P, m) {
	const trunkH = 1.8 * m.y;
	return [
		piece('trunk', 'cylinder', scaledSize(0.55, 1.8, 0.55, m), P.wood, 'trunk', at(jitter(rng, 0.08), trunkH / 2, jitter(rng, 0.08))),
		piece('canopy low', 'sphere', scaledSize(2.3, 2, 2.3, m), P.leaf, 'foliage', at(jitter(rng, 0.25), trunkH + 0.7 * m.y, jitter(rng, 0.25))),
		piece('canopy mid', 'sphere', scaledSize(1.8, 1.6, 1.8, m), P.leafDark, 'foliage', at(jitter(rng, 0.3), trunkH + 1.5 * m.y, jitter(rng, 0.3))),
		piece('canopy top', 'sphere', scaledSize(1.3, 1.2, 1.3, m), P.leaf, 'foliage', at(jitter(rng, 0.3), trunkH + 2.2 * m.y, jitter(rng, 0.3)))
	];
}

function buildBush(rng, P, m) {
	return [
		piece('bush low', 'sphere', scaledSize(1.4, 1, 1.4, m), P.leafDark, 'foliage', at(jitter(rng, 0.2), 0.5 * m.y, jitter(rng, 0.2))),
		piece('bush mid', 'sphere', scaledSize(1.1, 0.9, 1.1, m), P.leaf, 'foliage', at(0.55 * m.x + jitter(rng, 0.2), 0.65 * m.y, jitter(rng, 0.2))),
		piece('bush top', 'sphere', scaledSize(0.85, 0.75, 0.85, m), P.leafDark, 'foliage', at(-0.5 * m.x + jitter(rng, 0.2), 0.9 * m.y, 0.2 * m.z))
	];
}

function flowerPieces(rng, P, m, cx, cz, blossomColor) {
	return [
		piece('stem', 'cylinder', scaledSize(0.12, 0.9, 0.12, m), P.leafDark, 'stem', at(cx, 0.45 * m.y, cz)),
		piece('leaf', 'sphere', scaledSize(0.35, 0.18, 0.35, m), P.leaf, 'foliage', at(cx + 0.22 * m.x, 0.5 * m.y, cz)),
		piece('blossom', 'sphere', scaledSize(0.5, 0.42, 0.5, m), blossomColor, 'blossom', at(cx, 1 * m.y, cz))
	];
}

function buildFlower(rng, P, m) {
	const colors = [P.accent, '#d86a8a', '#e8e8f0', '#c65a3a'];
	return flowerPieces(rng, P, m, 0, 0, colors[Math.floor(rng() * colors.length)]);
}

function buildGarden(rng, P, m) {
	const parts = [
		piece('soil', 'box', scaledSize(4.2, 0.28, 3.2, m), P.woodDark, 'soil', at(0, 0.14 * m.y, 0))
	];
	const spots = [[-1.3, -0.8], [0, -0.9], [1.3, -0.7], [-0.7, 0.7], [0.8, 0.8]];
	const colors = [P.accent, '#d86a8a', '#e8e8f0'];
	for (let i = 0; i < spots.length; i += 1) {
		parts.push(...flowerPieces(rng, P, m, spots[i][0] * m.x, spots[i][1] * m.z, colors[i % colors.length]));
	}
	parts.push(...buildBush(rng, P, { x: m.x * 0.8, y: m.y * 0.8, z: m.z * 0.8 }).map(b => {
		return { ...b, offset: { x: b.offset.x + 1.6 * m.x, y: b.offset.y + 0.28 * m.y, z: b.offset.z - 1.1 * m.z } };
	}));
	return parts;
}

function buildTable(rng, P, m) {
	const topY = 0.95 * m.y;
	const legR = 0.09 * Math.min(m.x, m.z);
	const parts = [
		piece('tabletop', 'box', scaledSize(2.2, 0.16, 1.4, m), P.wood, 'tabletop', at(0, topY, 0))
	];
	for (const [lx, lz] of [[-0.95, -0.55], [0.95, -0.55], [-0.95, 0.55], [0.95, 0.55]]) {
		parts.push(piece('leg', 'cylinder', { x: legR * 2, y: topY - 0.08 * m.y, z: legR * 2 }, P.woodDark, 'leg', at(lx * m.x, (topY - 0.08 * m.y) / 2, lz * m.z)));
	}
	return parts;
}

function buildChair(rng, P, m) {
	const seatY = 0.55 * m.y;
	const parts = [
		piece('seat', 'box', scaledSize(0.95, 0.14, 0.95, m), P.wood, 'seat', at(0, seatY, 0)),
		piece('backrest', 'box', scaledSize(0.95, 1, 0.12, m), P.wood, 'backrest', at(0, seatY + 0.55 * m.y, -0.44 * m.z))
	];
	for (const [lx, lz] of [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]]) {
		parts.push(piece('leg', 'cylinder', { x: 0.14 * m.x, y: seatY, z: 0.14 * m.z }, P.woodDark, 'leg', at(lx * m.x, seatY / 2, lz * m.z)));
	}
	return parts;
}

function buildBench(rng, P, m) {
	return [
		piece('seat', 'box', scaledSize(2.6, 0.2, 0.75, m), P.wood, 'seat', at(0, 0.62 * m.y, 0)),
		piece('leg left', 'box', scaledSize(0.18, 0.55, 0.65, m), P.woodDark, 'leg', at(-1.05 * m.x, 0.28 * m.y, 0)),
		piece('leg right', 'box', scaledSize(0.18, 0.55, 0.65, m), P.woodDark, 'leg', at(1.05 * m.x, 0.28 * m.y, 0))
	];
}

function buildMenorah(rng, P, m) {
	const parts = [
		piece('base', 'box', scaledSize(1.3, 0.16, 0.55, m), P.accent, 'base', at(0, 0.08 * m.y, 0)),
		piece('stem', 'cylinder', scaledSize(0.16, 1.3, 0.16, m), P.accent, 'stem', at(0, 0.8 * m.y, 0)),
		piece('branch bar', 'box', scaledSize(1.7, 0.09, 0.14, m), P.accent, 'branch', at(0, 1.45 * m.y, 0))
	];
	for (let i = 0; i < 7; i += 1) {
		const x = (i - 3) * 0.25 * m.x;
		parts.push(piece(`cup ${i + 1}`, 'cylinder', scaledSize(0.2, 0.2, 0.2, m), P.accent, 'cup', at(x, 1.6 * m.y, 0)));
	}
	return parts;
}

function buildLamp(rng, P, m) {
	return [
		piece('base', 'cylinder', scaledSize(0.6, 0.14, 0.6, m), P.woodDark, 'base', at(0, 0.07 * m.y, 0)),
		piece('pole', 'cylinder', scaledSize(0.12, 1.7, 0.12, m), P.woodDark, 'pole', at(0, 0.95 * m.y, 0)),
		piece('shade', 'cylinder', scaledSize(0.95, 0.55, 0.95, m), P.accent, 'shade', at(0, 1.95 * m.y, 0))
	];
}

function buildArk(rng, P, m) {
	return [
		piece('cabinet', 'box', scaledSize(2.3, 3, 1.3, m), P.wood, 'cabinet', at(0, 1.5 * m.y, 0)),
		piece('door left', 'box', scaledSize(1, 2.3, 0.1, m), P.woodDark, 'door', at(-0.53 * m.x, 1.45 * m.y, 0.65 * m.z + 0.03)),
		piece('door right', 'box', scaledSize(1, 2.3, 0.1, m), P.woodDark, 'door', at(0.53 * m.x, 1.45 * m.y, 0.65 * m.z + 0.03)),
		piece('crown', 'box', scaledSize(1.3, 0.45, 0.9, m), P.accent, 'crown', at(0, 3.2 * m.y, 0)),
		piece('step', 'box', scaledSize(2.9, 0.22, 1.9, m), P.stone, 'step', at(0, 0.11 * m.y, 0))
	];
}

function buildBimah(rng, P, m) {
	const parts = [
		piece('platform', 'box', scaledSize(2.6, 0.9, 2.2, m), P.wood, 'platform', at(0, 0.45 * m.y, 0)),
		piece('reading table', 'box', scaledSize(1.2, 0.12, 0.8, m), P.woodDark, 'tabletop', at(0, 1.35 * m.y, 0))
	];
	for (const [lx, lz] of [[-1.15, -0.95], [1.15, -0.95], [-1.15, 0.95], [1.15, 0.95]]) {
		parts.push(piece('rail post', 'box', scaledSize(0.12, 0.85, 0.12, m), P.woodDark, 'rail', at(lx * m.x, 1.3 * m.y, lz * m.z)));
	}
	parts.push(piece('rail front', 'box', scaledSize(2.5, 0.1, 0.1, m), P.woodDark, 'rail', at(0, 1.72 * m.y, 0.95 * m.z)));
	parts.push(piece('rail back', 'box', scaledSize(2.5, 0.1, 0.1, m), P.woodDark, 'rail', at(0, 1.72 * m.y, -0.95 * m.z)));
	return parts;
}

function buildFence(rng, P, m) {
	return [
		piece('post left', 'box', scaledSize(0.2, 1.25, 0.2, m), P.wood, 'post', at(-1.1 * m.x, 0.62 * m.y, 0)),
		piece('post right', 'box', scaledSize(0.2, 1.25, 0.2, m), P.wood, 'post', at(1.1 * m.x, 0.62 * m.y, 0)),
		piece('rail high', 'box', scaledSize(2.4, 0.13, 0.09, m), P.woodDark, 'rail', at(0, 0.95 * m.y, 0)),
		piece('rail low', 'box', scaledSize(2.4, 0.13, 0.09, m), P.woodDark, 'rail', at(0, 0.5 * m.y, 0))
	];
}

function buildBridge(rng, P, m) {
	const parts = [
		piece('deck', 'box', scaledSize(4.2, 0.28, 1.7, m), P.wood, 'deck', at(0, 0.85 * m.y, 0)),
		piece('rail left', 'box', scaledSize(4.2, 0.55, 0.12, m), P.woodDark, 'rail', at(0, 1.35 * m.y, 0.79 * m.z)),
		piece('rail right', 'box', scaledSize(4.2, 0.55, 0.12, m), P.woodDark, 'rail', at(0, 1.35 * m.y, -0.79 * m.z))
	];
	for (const lx of [-1.8, 1.8]) {
		for (const lz of [-0.7, 0.7]) {
			parts.push(piece('pier', 'box', scaledSize(0.35, 0.75, 0.35, m), P.stone, 'pier', at(lx * m.x, 0.37 * m.y, lz * m.z)));
		}
	}
	return parts;
}

function buildShelf(rng, P, m) {
	const parts = [
		piece('side left', 'box', scaledSize(0.14, 2.2, 0.9, m), P.wood, 'frame', at(-0.75 * m.x, 1.1 * m.y, 0)),
		piece('side right', 'box', scaledSize(0.14, 2.2, 0.9, m), P.wood, 'frame', at(0.75 * m.x, 1.1 * m.y, 0)),
		piece('top', 'box', scaledSize(1.64, 0.14, 0.9, m), P.wood, 'frame', at(0, 2.13 * m.y, 0))
	];
	for (let i = 0; i < 3; i += 1) {
		parts.push(piece(`shelf ${i + 1}`, 'box', scaledSize(1.5, 0.1, 0.85, m), P.woodDark, 'shelf', at(0, (0.55 + i * 0.55) * m.y, 0)));
	}
	return parts;
}

function buildHill(rng, P, m) {
	const w = 4.4 + jitter(rng, 0.7);
	const d = 3.8 + jitter(rng, 0.7);
	return [
		piece('hill', 'sphere', scaledSize(w, 1.7, d, m), P.leaf, 'mound', at(0, 0.15 * m.y, 0))
	];
}

function buildPond(rng, P, m) {
	const r = 2 + jitter(rng, 0.4);
	const parts = [
		piece('water', 'cylinder', scaledSize(r * 2, 0.2, r * 2, m), P.water, 'water', at(0, 0.1 * m.y, 0))
	];
	for (let i = 0; i < 3; i += 1) {
		const angle = rng() * Math.PI * 2;
		const dist = r * (0.3 + rng() * 0.45);
		parts.push(piece('lily pad', 'cylinder', scaledSize(0.55, 0.07, 0.55, m), P.leaf, 'foliage', at(Math.cos(angle) * dist * m.x, 0.24 * m.y, Math.sin(angle) * dist * m.z)));
	}
	return parts;
}

function buildPath(rng, P, m) {
	return [
		piece('path', 'box', scaledSize(6.5, 0.14, 1.5, m), P.stone, 'path', at(0, 0.07 * m.y, 0))
	];
}

function buildRock(rng, P, m) {
	const wobble = () => 1 + jitter(rng, 0.12);
	return [
		piece('rock', 'sphere', scaledSize(1.5 * wobble(), 1.15 * wobble(), 1.35 * wobble(), m), P.stone, 'rock', at(0, 0.45 * m.y, 0)),
		piece('rock small', 'sphere', scaledSize(0.8 * wobble(), 0.65 * wobble(), 0.75 * wobble(), m), P.stone, 'rock', at(0.95 * m.x, 0.28 * m.y, 0.35 * m.z))
	];
}

function buildField(rng, P, m) {
	const parts = [
		piece('meadow', 'box', scaledSize(8.5, 0.16, 6.5, m), P.leaf, 'ground', at(0, 0.08 * m.y, 0))
	];
	const colors = [P.accent, '#d86a8a', '#e8e8f0'];
	for (let i = 0; i < 5; i += 1) {
		parts.push(piece('wildflower', 'sphere', scaledSize(0.4, 0.34, 0.4, m), colors[i % colors.length], 'blossom', at(jitter(rng, 3.4) * m.x, 0.32 * m.y, jitter(rng, 2.4) * m.z)));
	}
	parts.push(piece('field stone', 'sphere', scaledSize(0.9, 0.7, 0.85, m), P.stone, 'rock', at(jitter(rng, 3) * m.x, 0.3 * m.y, jitter(rng, 2.2) * m.z)));
	return parts;
}

const BUILDERS = Object.freeze({
	house: buildHouse,
	shul: buildShul,
	shop: buildShop,
	school: buildSchool,
	tower: buildTower,
	hall: buildHall,
	tree: buildTree,
	bush: buildBush,
	flower: buildFlower,
	garden: buildGarden,
	table: buildTable,
	chair: buildChair,
	bench: buildBench,
	menorah: buildMenorah,
	lamp: buildLamp,
	ark: buildArk,
	bimah: buildBimah,
	fence: buildFence,
	bridge: buildBridge,
	shelf: buildShelf,
	hill: buildHill,
	pond: buildPond,
	path: buildPath,
	rock: buildRock,
	field: buildField
});

const KIND_NOUNS = Object.freeze({
	house: 'house', shul: 'shul', shop: 'shop', school: 'school', tower: 'tower', hall: 'hall',
	tree: 'tree', bush: 'bush', flower: 'flower', garden: 'garden',
	table: 'table', chair: 'chair', bench: 'bench', menorah: 'menorah', lamp: 'lamp',
	ark: 'aron kodesh', bimah: 'bimah', fence: 'fence', bridge: 'bridge', shelf: 'bookshelf',
	hill: 'hill', pond: 'pond', path: 'path', rock: 'rock', field: 'meadow'
});

/**
 * @param {{kind:string, kindWord:string|null}} spec Interpreted spec.
 * @param {number} index Zero-based instance index.
 * @param {number} count Total instance count.
 * @returns {string} Human build label, e.g. "Oak tree 2".
 */
function buildLabel(spec, index, count) {
	const noun = KIND_NOUNS[spec.kind] || spec.kind;
	let label = spec.kindWord && spec.kindWord !== spec.kind
		? `${capitalize(spec.kindWord)} ${noun}`
		: capitalize(noun);
	if (count > 1) {
		label += ` ${index + 1}`;
	}
	return label;
}

function capitalize(word) {
	const text = String(word || '');
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * @param {object} spec Interpreted build spec.
 * @returns {object} Normalized spec with safe defaults.
 */
function normalizeSpec(spec) {
	const source = spec || {};
	const category = GENERATE_CATEGORIES.includes(source.category) ? source.category : 'buildings';
	return {
		category,
		kind: BUILDERS[source.kind] ? source.kind : 'house',
		kindWord: source.kindWord || null,
		count: Math.min(Math.max(Math.trunc(source.count) || 1, 1), 12),
		size: SIZE_MULTIPLIERS[source.size] ? source.size : 'medium',
		style: PALETTES[source.style] ? source.style : 'meadow',
		seed: (Math.abs(Math.trunc(source.seed)) || 7) >>> 0
	};
}

const CORE_SHAPE_NAMES = Object.freeze({
	box: 'cube',
	cube: 'cube',
	cylinder: 'cylinder',
	sphere: 'sphere',
	plane: 'plane'
});

/**
 * Derives vertex/triangle counts for one piece through the procedural core.
 * Counts depend on topology only, so dimensions are irrelevant.
 * @param {object} piece Composite piece with shape and size.
 * @returns {{vertices:number, triangles:number}|null} Metrics or null when unavailable.
 */
export function pieceMetrics(piece) {
	const coreName = CORE_SHAPE_NAMES[String(piece?.shape || '').toLowerCase()];
	if (!coreName) {
		return null;
	}
	try {
		const geometry = generatePrimitiveGeometry(coreName, {});
		return {
			vertices: Math.floor((geometry.positions?.length || 0) / 3),
			triangles: Math.floor((geometry.indices?.length || 0) / 3)
		};
	} catch {
		return null;
	}
}

/**
 * @param {object[]} pieces Composite pieces.
 * @returns {{vertices:number, triangles:number}} Summed metrics across pieces.
 */
export function compositeMetrics(pieces) {
	let vertices = 0;
	let triangles = 0;
	for (const part of pieces || []) {
		const metrics = pieceMetrics(part);
		if (metrics) {
			vertices += metrics.vertices;
			triangles += metrics.triangles;
		}
	}
	return { vertices, triangles };
}

/**
 * Converts one composite piece into a studio-ready object record.
 * The piece center offset travels with the object so StudioDocumentState.addGroup
 * can place the build assembled, exactly as the preview shows it.
 * @param {object} pc Composite piece.
 * @param {object} build Build identity {catalogId, label, seed}.
 * @param {number} pieceIndex Index within the build.
 * @returns {object} Studio-ready object {catalogId,label,shape,size,color,materialRole,offset,position,rotation,scale,seed}.
 */
function buildStudioObject(pc, build, pieceIndex) {
	return {
		catalogId: build.catalogId,
		label: `${build.label} — ${pc.name}`,
		shape: pc.shape,
		size: { x: pc.size.x, y: pc.size.y, z: pc.size.z },
		color: pc.color,
		materialRole: pc.materialRole,
		offset: { x: pc.offset.x, y: pc.offset.y, z: pc.offset.z },
		position: { x: 0, y: 0, z: 0 },
		rotation: { x: pc.rotation.x, y: pc.rotation.y, z: pc.rotation.z },
		scale: { x: 1, y: 1, z: 1 },
		seed: (build.seed + pieceIndex) >>> 0
	};
}

/**
 * Generates one or more composite builds from a spec.
 * @param {object} spec Interpreted build spec {category, kind, count, size, style, seed}.
 * @returns {object[]} Builds: {catalogId, label, category, kind, seed, pieces, objects, metrics}.
 */
export function generateFromSpec(spec) {
	const normalized = normalizeSpec(spec);
	const palette = PALETTES[normalized.style];
	const multiplier = SIZE_MULTIPLIERS[normalized.size];
	const builder = BUILDERS[normalized.kind];
	const builds = [];
	for (let i = 0; i < normalized.count; i += 1) {
		const instanceSeed = (normalized.seed + i * 101) >>> 0;
		const rng = mulberry32(instanceSeed);
		const pieces = builder(rng, palette, multiplier);
		const label = buildLabel(normalized, i, normalized.count);
		const catalogId = `gen-${normalized.category}-${normalized.kind}-${instanceSeed}`;
		const build = { catalogId, label, seed: instanceSeed };
		builds.push({
			catalogId,
			label,
			category: normalized.category,
			kind: normalized.kind,
			seed: instanceSeed,
			pieces,
			objects: pieces.map((pc, pieceIndex) => buildStudioObject(pc, build, pieceIndex)),
			metrics: compositeMetrics(pieces)
		});
	}
	return builds;
}

/**
 * Flattens generated builds into the plain array of studio-ready objects
 * that flows into StudioDocumentState.add, one part per composite piece.
 * @param {object[]} builds Builds from generateFromSpec.
 * @returns {object[]} Studio-ready objects.
 */
export function flattenGeneratedObjects(builds) {
	return (builds || []).flatMap(build => build.objects || []);
}
