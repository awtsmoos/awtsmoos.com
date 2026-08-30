//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorWorldCodec.js
 * @description Parses and validates portable creator worlds before any live scene or collision side effect can occur.
 * The Awtsmoos gives every true world a name and measure before form enters sight;
 * Awtsmoos.com guards format, identity, catalog kind, finite transform, and bounded size so imported creation arrives in ordered light.
 */

import { WORLD_FORMAT } from '../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';

const MAXIMUM_COORDINATE = 1000000;
const MAXIMUM_DIMENSION = 1024;

export function parseCreatorWorld(sourceOhr) {
	const documentMalchus = typeof sourceOhr === 'string'
		? JSON.parse(sourceOhr)
		: structuredClone(sourceOhr);
	validateCreatorWorld(documentMalchus);
	return documentMalchus;
}

export function creatorWorldParts(documentMalchus) {
	const objects = documentMalchus?.resources?.objects || {};
	return Object.values(objects)
		.filter(resource => resource?.type === 'mitzvahWorld.builder.part')
		.map(resource => Object.freeze({
			definition: validateDefinition(resource.definition, resource.id),
			kind: validateKind(resource.kind)
		}));
}

export function validateCreatorWorld(documentMalchus) {
	if (!documentMalchus || typeof documentMalchus !== 'object' || Array.isArray(documentMalchus)) {
		throw new Error('CREATOR_WORLD_OBJECT_REQUIRED');
	}
	if (documentMalchus.format !== WORLD_FORMAT) {
		throw new Error(`CREATOR_WORLD_FORMAT_UNSUPPORTED:${documentMalchus.format || 'missing'}`);
	}
	if (documentMalchus.version !== 1) {
		throw new Error(`CREATOR_WORLD_VERSION_UNSUPPORTED:${documentMalchus.version}`);
	}
	if (!documentMalchus.resources || typeof documentMalchus.resources !== 'object') {
		throw new Error('CREATOR_WORLD_RESOURCES_REQUIRED');
	}
	creatorWorldParts(documentMalchus);
	return documentMalchus;
}

function validateKind(kindOhr) {
	mitzvahWorldCreatorPart(kindOhr);
	return kindOhr;
}

function validateDefinition(definitionTiferes, expectedId) {
	if (!definitionTiferes || definitionTiferes.id !== expectedId) {
		throw new Error(`CREATOR_WORLD_PART_ID_MISMATCH:${expectedId}`);
	}
	validatePoint(definitionTiferes.position, expectedId);
	validatePoint(definitionTiferes.size, expectedId, true);
	if (!Number.isFinite(definitionTiferes.rotation?.y)) {
		throw new Error(`CREATOR_WORLD_ROTATION_INVALID:${expectedId}`);
	}
	if (definitionTiferes.shape !== 'box') {
		throw new Error(`CREATOR_WORLD_SHAPE_UNSUPPORTED:${expectedId}`);
	}
	return structuredClone(definitionTiferes);
}

function validatePoint(pointOhr, idOhr, positive = false) {
	for (const axisOhr of ['x', 'y', 'z']) {
		const valueOhr = pointOhr?.[axisOhr];
		if (!Number.isFinite(valueOhr)) {
			throw new Error(`CREATOR_WORLD_VECTOR_INVALID:${idOhr}:${axisOhr}`);
		}
		if (Math.abs(valueOhr) > MAXIMUM_COORDINATE) {
			throw new Error(`CREATOR_WORLD_COORDINATE_OUT_OF_RANGE:${idOhr}:${axisOhr}`);
		}
		if (positive && (valueOhr <= 0 || valueOhr > MAXIMUM_DIMENSION)) {
			throw new Error(`CREATOR_WORLD_SIZE_OUT_OF_RANGE:${idOhr}:${axisOhr}`);
		}
	}
}
