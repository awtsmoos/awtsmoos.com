// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseShapeResolver.js
 * @description Expands one universe catalog part into composed primitive definitions.
 * Yaakov 2026-10-11: players create houses, trees, characters — not just boxes.
 * Each universe part resolves to 1..N renderer-ready primitives (box, cylinder,
 * sphere, triPrism, diamond, doorway) with relative offsets, so the creator's
 * single-part document/runtime/history covenant keeps working: one placement
 * commits every sub-part atomically and undoes them together.
 */

import { universePart } from './MitzvahWorldUniverseCatalog.js';

/**
 * Expands one universe part into primitive definitions.
 * @param {string} partId Universe catalog part id.
 * @param {object} base Base placement definition { id, position, rotation, color }.
 * @returns {object[]} Frozen array of primitive definitions, each with a stable
 *   derived id `${base.id}::${index}` and absolute world position.
 */
export function resolveUniverseShape(partId, base = {}) {
	const part = universePart(partId);
	const composer = COMPOSERS[part.shape] || COMPOSERS.box;
	const size = part.size;
	const color = base.color || part.color;
	const pieces = composer(size, color, part);
	const basePosition = base.position || { x: 0, y: 0, z: 0 };
	const baseRotationY = Number(base.rotation?.y) || 0;
	return Object.freeze(pieces.map((piece, index) => {
		const offset = rotateOffset(piece.offset, baseRotationY);
		return Object.freeze({
			color: piece.color,
			id: `${base.id || partId}::${index}`,
			position: Object.freeze({
				x: basePosition.x + offset.x,
				y: basePosition.y + offset.y,
				z: basePosition.z + offset.z
			}),
			rotation: Object.freeze({ y: baseRotationY + (piece.rotationY || 0) }),
			shape: piece.shape,
			size: Object.freeze({ ...piece.size }),
			solid: piece.solid !== false,
			userData: Object.freeze({
				AwtsmoosCreatorPart: partId,
				AwtsmoosUniverseGroup: base.id || partId,
				AwtsmoosUniversePiece: index
			}),
			walkable: piece.walkable ?? part.walkable ?? false
		});
	}));
}

/** Returns true when the part needs multi-primitive composition (more than one piece). */
export function isCompositeUniversePart(partId) {
	const part = universePart(partId);
	const composer = COMPOSERS[part.shape] || COMPOSERS.box;
	return composer(part.size, part.color, part).length > 1;
}

function piece(shape, size, color, offset, extra = {}) {
	return { color, offset, shape, size, ...extra };
}

function box(w, h, d, color, x, y, z, extra) {
	return piece('box', { x: w, y: h, z: d }, color, { x, y, z }, extra);
}

const COMPOSERS = {
	box: (size, color) => [box(size.x, size.y, size.z, color, 0, 0, 0)],
	tent: (size, color) => [
		piece('triPrism', { x: size.x, y: size.y, z: size.z }, color, { x: 0, y: 0, z: 0 })
	],
	house: (size, color, part) => {
		const wallH = size.y * 0.62;
		const roofH = size.y * 0.38;
		return [
			box(size.x, wallH, size.z, color, 0, -size.y / 2 + wallH / 2, 0),
			piece('triPrism', { x: size.x * 1.06, y: roofH, z: size.z * 1.06 }, shade(color, -18), {
				x: 0, y: -size.y / 2 + wallH + roofH / 2, z: 0
			}),
			piece('doorway', { x: size.x * 0.24, y: wallH * 0.72, z: 0.3 }, '#3a2c1c', {
				x: 0, y: -size.y / 2 + wallH * 0.36, z: size.z / 2
			})
		];
	},
	hall: (size, color) => {
		const wallH = size.y * 0.66;
		const roofH = size.y * 0.34;
		return [
			box(size.x, wallH, size.z, color, 0, -size.y / 2 + wallH / 2, 0),
			piece('triPrism', { x: size.x * 1.05, y: roofH, z: size.z * 1.05 }, shade(color, -22), {
				x: 0, y: -size.y / 2 + wallH + roofH / 2, z: 0
			}),
			box(size.x * 0.2, wallH * 0.4, 0.1, '#bfe3ea', -size.x * 0.25, 0, size.z / 2, { solid: false }),
			box(size.x * 0.2, wallH * 0.4, 0.1, '#bfe3ea', size.x * 0.25, 0, size.z / 2, { solid: false })
		];
	},
	sukkah: (size, color) => {
		const wallH = size.y * 0.72;
		const parts = [
			box(size.x, wallH, 0.18, color, 0, -size.y / 2 + wallH / 2, -size.z / 2 + 0.09),
			box(0.18, wallH, size.z, color, -size.x / 2 + 0.09, -size.y / 2 + wallH / 2, 0),
			box(0.18, wallH, size.z, color, size.x / 2 - 0.09, -size.y / 2 + wallH / 2, 0)
		];
		const slats = 5;
		for (let i = 0; i < slats; i++) {
			parts.push(box(size.x / slats * 0.7, 0.1, size.z, '#6e8f4e',
				-size.x / 2 + (i + 0.5) * (size.x / slats), -size.y / 2 + wallH + 0.05, 0));
		}
		return parts;
	},
	tower: (size, color) => {
		const legH = size.y * 0.7;
		const topY = -size.y / 2 + legH;
		const parts = [];
		const inset = 0.32;
		for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
			parts.push(box(0.28, legH, 0.28, shade(color, -12),
				sx * (size.x / 2 - inset), -size.y / 2 + legH / 2, sz * (size.z / 2 - inset)));
		}
		parts.push(box(size.x, 0.25, size.z, shade(color, 8), 0, topY + 0.12, 0, { walkable: true }));
		parts.push(piece('triPrism', { x: size.x * 1.1, y: size.y * 0.2, z: size.z * 1.1 }, shade(color, -20), {
			x: 0, y: topY + 0.25 + size.y * 0.1, z: 0
		}));
		return parts;
	},
	bridge: (size, color) => [
		box(size.x, 0.3, size.z, color, 0, -size.y / 2 + 0.15, 0, { walkable: true }),
		box(size.x, 0.7, 0.15, shade(color, -14), 0, -size.y / 2 + 0.65, -size.z / 2 + 0.08),
		box(size.x, 0.7, 0.15, shade(color, -14), 0, -size.y / 2 + 0.65, size.z / 2 - 0.08)
	],
	fence: (size, color) => {
		const parts = [box(size.x, 0.12, size.z, shade(color, -10), 0, 0.55, 0)];
		const posts = 3;
		for (let i = 0; i < posts; i++) {
			parts.push(box(0.18, 1.1, 0.18, shade(color, -16),
				-size.x / 2 + i * (size.x / (posts - 1)), 0, 0));
		}
		return parts;
	},
	well: (size, color) => [
		piece('cylinder', { x: size.x, y: size.y * 0.55, z: size.z }, color, { x: 0, y: -size.y * 0.22, z: 0 }),
		piece('triPrism', { x: size.x * 1.25, y: size.y * 0.35, z: size.z * 1.25 }, shade(color, -20), {
			x: 0, y: size.y * 0.23, z: 0
		})
	],
	arch: (size, color) => [
		box(0.5, size.y * 0.8, size.z, color, -size.x / 2 + 0.25, -size.y * 0.1, 0),
		box(0.5, size.y * 0.8, size.z, color, size.x / 2 - 0.25, -size.y * 0.1, 0),
		box(size.x, size.y * 0.2, size.z, shade(color, -8), 0, size.y * 0.4, 0)
	],
	tree: (size, color, part) => {
		const trunkH = size.y * 0.42;
		const leafColor = part.id.startsWith('pine') ? '#2c5230' : part.id.startsWith('palm') ? '#4a7038' : '#3f6b2f';
		return [
			piece('cylinder', { x: size.x * 0.22, y: trunkH, z: size.z * 0.22 }, '#5d4630', {
				x: 0, y: -size.y / 2 + trunkH / 2, z: 0
			}),
			piece('sphere', { x: size.x, y: size.y * 0.42, z: size.z }, leafColor, {
				x: 0, y: -size.y / 2 + trunkH + size.y * 0.2, z: 0
			}, { solid: false }),
			piece('sphere', { x: size.x * 0.7, y: size.y * 0.3, z: size.z * 0.7 }, shade(leafColor, 14), {
				x: size.x * 0.18, y: -size.y / 2 + trunkH + size.y * 0.38, z: 0
			}, { solid: false })
		];
	},
	patch: (size, color) => [
		box(size.x, size.y, size.z, color, 0, -size.y * 0.3, 0, { solid: false })
	],
	rock: (size, color) => [
		piece('sphere', { x: size.x, y: size.y, z: size.z }, color, { x: 0, y: -size.y * 0.18, z: 0 })
	],
	bush: (size, color) => [
		piece('sphere', { x: size.x, y: size.y, z: size.z }, color, { x: 0, y: -size.y * 0.15, z: 0 }, { solid: false })
	],
	npc: (size, color) => [
		piece('cylinder', { x: size.x * 0.8, y: size.y * 0.72, z: size.z * 0.8 }, color, {
			x: 0, y: -size.y / 2 + size.y * 0.36, z: 0
		}),
		piece('sphere', { x: size.x * 0.55, y: size.y * 0.28, z: size.z * 0.55 }, '#d9b48f', {
			x: 0, y: -size.y / 2 + size.y * 0.86, z: 0
		}, { solid: false })
	],
	animal: (size, color, part) => {
		if (part.id === 'horse') {
			// Legs plant the body on the ground; neck and head stack on the body.
			const legH = size.y * 0.3;
			const bodyH = size.y * 0.42;
			const bodyY = -size.y / 2 + legH + bodyH / 2;
			const parts = [];
			for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
				parts.push(box(size.x * 0.22, legH, size.x * 0.22, shade(color, -10),
					sx * size.x * 0.3, -size.y / 2 + legH / 2, sz * size.z * 0.26));
			}
			parts.push(box(size.x, bodyH, size.z * 0.7, color, 0, bodyY, -size.z * 0.1));
			const neckH = size.y * 0.42;
			const neckY = bodyY + bodyH / 2 + size.y * 0.15;
			parts.push(box(size.x * 0.45, neckH, size.z * 0.3, shade(color, 10), 0, neckY, size.z * 0.32));
			parts.push(piece('sphere', { x: size.x * 0.5, y: size.y * 0.28, z: size.z * 0.32 }, shade(color, 16), {
				x: 0, y: neckY + size.y * 0.23, z: size.z * 0.42
			}, { solid: false }));
			return parts;
		}
		return [
			box(size.x, size.y * 0.62, size.z, color, 0, -size.y * 0.12, 0),
			piece('sphere', { x: size.x * 0.55, y: size.y * 0.42, z: size.z * 0.45 }, shade(color, 18), {
				x: 0, y: size.y * 0.08, z: size.z * 0.55
			}, { solid: false })
		];
	},
	beacon: (size, color) => [
		piece('cylinder', { x: 0.22, y: size.y * 0.72, z: 0.22 }, '#8a6f3f', { x: 0, y: -size.y * 0.14, z: 0 }),
		piece('diamond', { x: 0.7, y: 0.9, z: 0.7 }, color, { x: 0, y: size.y * 0.32, z: 0 }, { solid: false })
	]
};

function rotateOffset(offset, yaw) {
	if (!yaw) return { ...offset };
	const cos = Math.cos(yaw);
	const sin = Math.sin(yaw);
	return {
		x: offset.x * cos + offset.z * sin,
		y: offset.y,
		z: -offset.x * sin + offset.z * cos
	};
}

function shade(hex, amount) {
	const number = parseInt(String(hex).replace('#', ''), 16);
	const clamp = value => Math.max(0, Math.min(255, value + amount));
	const r = clamp((number >> 16) & 255);
	const g = clamp((number >> 8) & 255);
	const b = clamp(number & 255);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
