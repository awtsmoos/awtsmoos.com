// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFoundationSystem.js
 * @description Resolves canonical architecture into explicit retaining foundations.
 * The Awtsmoos supports every named vessel whether its form arrives as a simple primitive
 * or as hand-authored world vertices; Awtsmoos.com keeps identity, footprint, and earth aligned.
 */

import { CANONICAL_FOOTPRINTS_BY_ID } from './CanonicalVillageFootprints.js';
import { CANONICAL_VILLAGE_IDS } from './CanonicalVillageIdentifiers.js';
import {
	canCreateFoundation,
	createFoundationDefinition
} from './VillageFoundationGeometry.js';

const SPECIALIZED_SUPPORT_IDS = new Set(['BRIDGE01', 'ENTR01']);
const PROXY_HEIGHT = 1;

/**
 * Creates exactly one retaining support for every non-specialized canonical structure.
 *
 * @param {object[]} architectureDefinitions Visible architecture definitions.
 * @param {object} groundSampler Shared terrain authority.
 * @returns {object[]} Foundation definitions with immutable evidence statistics.
 */
export function createVillageFoundationDefinitions(
	architectureDefinitions,
	groundSampler
) {
	const anchors = architectureDefinitions
		.map(resolveFoundationAnchor)
		.filter(Boolean);
	const foundations = anchors.map((anchor) => {
		return createFoundationDefinition(anchor, groundSampler);
	});
	foundations.stats = Object.freeze({
		definitions: foundations.length,
		supportedIds: Object.freeze(anchors.map(canonicalId).sort())
	});
	return foundations;
}

function resolveFoundationAnchor(definition) {
	const id = canonicalId(definition);
	if (!supportedCanonicalId(id)) {
		return null;
	}
	if (canCreateFoundation(definition)) {
		return definition;
	}
	return createManualFoundationProxy(definition, id);
}

function createManualFoundationProxy(definition, id) {
	const footprint = CANONICAL_FOOTPRINTS_BY_ID[id];
	const structureBottom = minimumVertexHeight(definition.vertices);
	if (!footprint || !Number.isFinite(structureBottom)) {
		return null;
	}
	return {
		position: {
			x: footprint.x,
			y: structureBottom + PROXY_HEIGHT / 2,
			z: footprint.z
		},
		rotation: { y: footprint.yaw || 0 },
		shape: 'box',
		size: {
			x: footprint.width,
			y: PROXY_HEIGHT,
			z: footprint.depth
		},
		userData: {
			...definition.userData,
			canonicalId: id,
			foundationAnchorSource: 'canonical-footprint-and-manual-mesh-bottom'
		}
	};
}

function minimumVertexHeight(vertices) {
	if (!Array.isArray(vertices) || vertices.length === 0) {
		return Number.NaN;
	}
	const heights = vertices
		.map((vertex) => Number(vertex?.[1]))
		.filter(Number.isFinite);
	return heights.length > 0 ? Math.min(...heights) : Number.NaN;
}

function supportedCanonicalId(id) {
	return CANONICAL_VILLAGE_IDS.includes(id)
		&& !SPECIALIZED_SUPPORT_IDS.has(id);
}

function canonicalId(definition) {
	return definition.userData?.canonicalId;
}
