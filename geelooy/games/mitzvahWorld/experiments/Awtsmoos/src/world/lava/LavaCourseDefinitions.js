//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaCourseDefinitions.js
 * @description Defines renderer-neutral lava sea, platform, and coin coordinates for the extended challenge.
 * Gameplay owns route semantics here while shared primitive rendering owns native geometry and material construction.
 */

import { createLavaCourseNodes } from './LavaCoursePath.js';
import {
	createLavaBrickMaterial,
	createLavaMaterial
} from './LavaMaterialDefinitions.js';

export const LAVA_START = Object.freeze({
	x: -62,
	z: 42
});

export const ERETZ_RETURN = Object.freeze({
	x: 0,
	z: 4
});

export const LAVA_Y = -1.18;

/**
 * Creates the deterministic lava sea and complete walkable platform descriptors.
 * @param {object} [assets={}] Optional already-hydrated visual assets.
 * @returns {object[]} Primitive descriptors consumed by shared primitive rendering.
 */
export function lavaWorldDefs(assets = {}) {
	const lava = createLavaMaterial(assets);
	const brick = createLavaBrickMaterial(assets);
	const definitions = [createLavaSeaDefinition(lava)];

	for (const [index, node] of createLavaCourseNodes().entries()) {
		definitions.push(
			createPlatformDefinition(index, node, brick)
		);
	}

	return definitions;
}

/**
 * Creates deterministic coin centers above alternating course platforms.
 * @returns {Array<[number, number, number, number]>} Coin x/y/z plus platform floor height.
 */
export function lavaCoinData() {
	return createLavaCourseNodes()
		.filter((unused, index) => index > 0 && index % 2 === 0)
		.map(node => [
			node.x,
			node.y + 1.05,
			node.z,
			node.y + 0.29
		]);
}

/** Creates the non-walkable lava sea primitive beneath the complete challenge. */
function createLavaSeaDefinition(material) {
	return {
		id: 'lava-huge-extended-burning-sea',
		shape: 'box',
		solid: false,
		walkable: false,
		...material,
		position: {
			x: -18,
			y: LAVA_Y,
			z: 42
		},
		size: {
			x: 118,
			y: 0.22,
			z: 46
		},
		rotation: {
			y: 0.01
		}
	};
}

/** Creates one solid, walkable red-brick platform from a renderer-neutral route node. */
function createPlatformDefinition(index, node, material) {
	return {
		id: `lava-long-red-brick-platform-${index + 1}`,
		shape: 'box',
		solid: true,
		walkable: true,
		noEdge: true,
		...material,
		position: {
			x: node.x,
			y: node.y,
			z: node.z
		},
		size: {
			x: node.sx,
			y: 0.58,
			z: node.sz
		},
		rotation: {
			y: node.yaw || 0
		}
	};
}
