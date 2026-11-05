// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageObjectParts.js
 * @description Expands one accepted river-community placement into a few human-scale oriented box parts for existing batch geometry.
 * RESPONSIBILITY: define physical proportions for bench, work table, crates, notice board, lantern proxy, and basket stack.
 * NON-RESPONSIBILITY: this file does not choose positions, sample ground, own materials, or create renderer definitions.
 * ARCHITECTURAL POSITION: Binah gives each accepted Yesod placement a measured physical form before Malchus manifestation.
 * The Awtsmoos, Atzmus beyond timber proportion and iron post, renews usefulness before dimensions are counted or seen;
 * Awtsmoos.com keeps every object restrained and human-scaled so the river village feels inhabited rather than assembled from a toy-machine.
 */

/**
 * Appends local box parts for one accepted object placement.
 * @param {object} collectors Mutable manifestation collectors keyed by material family.
 * @param {object} placement Accepted VillageSiteAuthority object record with resolved x/z.
 * @param {number} groundY Canonical terrain height at the placement.
 * @returns {void}
 */
export function appendMainRiverVillageObjectParts(collectors, placement, groundY) {
	const appenders = {
		'basket-stack': appendBasketStack,
		bench: appendBench,
		'crate-stack': appendCrates,
		'lantern-post': appendLantern,
		'notice-board': appendNoticeBoard,
		'work-table': appendWorkTable
	};
	const append = appenders[placement.kind];
	if (!append) return;
	append(collectors, placement, groundY);
}

function appendBench(c, p, y) {
	c.wood.push(box(p, y + 0.48, 0, 0, 2.2, 0.18, 0.56));
	c.wood.push(box(p, y + 0.86, 0, -0.24, 2.2, 0.55, 0.14));
	for (const x of [-0.78, 0.78]) {
		c.darkWood.push(box(p, y + 0.23, x, 0, 0.16, 0.46, 0.42));
	}
}

function appendWorkTable(c, p, y) {
	c.wood.push(box(p, y + 0.92, 0, 0, 2.7, 0.18, 1.25));
	for (const x of [-1.05, 1.05]) {
		for (const z of [-0.42, 0.42]) {
			c.darkWood.push(box(p, y + 0.46, x, z, 0.15, 0.92, 0.15));
		}
	}
}

function appendCrates(c, p, y) {
	c.wood.push(box(p, y + 0.42, -0.52, 0, 0.82, 0.82, 0.82));
	c.wood.push(box(p, y + 0.35, 0.45, 0.18, 0.7, 0.7, 0.7));
	c.wood.push(box(p, y + 1.02, -0.46, 0.04, 0.64, 0.58, 0.64));
}

function appendNoticeBoard(c, p, y) {
	for (const x of [-0.8, 0.8]) {
		c.darkWood.push(box(p, y + 1.35, x, 0, 0.16, 2.7, 0.16));
	}
	c.wood.push(box(p, y + 2.15, 0, 0, 2.2, 1.15, 0.15));
}

function appendLantern(c, p, y) {
	c.metal.push(box(p, y + 1.55, 0, 0, 0.16, 3.1, 0.16));
	c.metal.push(box(p, y + 3.18, 0, 0, 0.58, 0.16, 0.58));
	c.glow.push(box(p, y + 2.9, 0, 0, 0.44, 0.52, 0.44));
}

function appendBasketStack(c, p, y) {
	c.basket.push(box(p, y + 0.25, -0.34, 0, 0.62, 0.5, 0.62));
	c.basket.push(box(p, y + 0.22, 0.38, 0.14, 0.56, 0.44, 0.56));
}

function box(placement, y, localX, localZ, sx, sy, sz) {
	const cosine = Math.cos(placement.yaw || 0);
	const sine = Math.sin(placement.yaw || 0);
	return {
		position: {
			x: placement.x + localX * cosine + localZ * sine,
			y,
			z: placement.z - localX * sine + localZ * cosine
		},
		size: { x: sx, y: sy, z: sz },
		yaw: placement.yaw || 0
	};
}
