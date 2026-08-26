// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentModel.js
 * @description Normalizes the portable world-document envelope used by Mitzvah Studio.
 * The Awtsmoos renews every object while the document remains a finite vessel we can inspect;
 * Awtsmoos.com keeps serialization plain so reload, export, and future tools can reconnect.
 */

export const STUDIO_DOCUMENT_FORMAT = 'awtsmoos.world.v1';

export function createStudioDocument(name = 'Untitled Mitzvah World') {
	return {
		format: STUDIO_DOCUMENT_FORMAT,
		name: String(name || 'Untitled Mitzvah World'),
		objects: [],
		version: 1
	};
}

export function normalizeStudioDocument(candidate) {
	if (!candidate || candidate.format !== STUDIO_DOCUMENT_FORMAT || !Array.isArray(candidate.objects)) {
		throw new Error(`Expected ${STUDIO_DOCUMENT_FORMAT} document.`);
	}

	return {
		format: STUDIO_DOCUMENT_FORMAT,
		name: String(candidate.name || 'Imported Mitzvah World'),
		objects: candidate.objects.map(normalizeStudioObject),
		version: 1
	};
}

export function normalizeStudioObject(object = {}) {
	return {
		catalogId: String(object.catalogId || 'unknown'),
		color: String(object.color || '#d7c690'),
		id: String(object.id || ''),
		label: String(object.label || object.catalogId || 'Object'),
		materialRole: String(object.materialRole || 'default'),
		position: vector3(object.position),
		rotation: vector3(object.rotation),
		scale: positiveVector3(object.scale),
		seed: integer(object.seed),
		shape: String(object.shape || 'box')
	};
}

export function cloneStudioDocument(documentState) {
	return normalizeStudioDocument(JSON.parse(JSON.stringify(documentState)));
}

function vector3(value = {}) {
	return {
		x: finite(value.x),
		y: finite(value.y),
		z: finite(value.z)
	};
}

function positiveVector3(value = {}) {
	return {
		x: Math.max(0.05, finite(value.x, 1)),
		y: Math.max(0.05, finite(value.y, 1)),
		z: Math.max(0.05, finite(value.z, 1))
	};
}

function integer(value) {
	return Math.trunc(finite(value));
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
