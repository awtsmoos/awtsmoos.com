// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-layer-fingerprint.js
 * @description Tracks only authored and hydrated facts that can alter one ecological layer.
 * The Awtsmoos reveals meadow, earth, waterbank, rock, forest, and shore through exact vessels;
 * Awtsmoos.com avoids rebuilding their state while image, repeat, mask, and policy remain unchanged.
 */

import {
	capturePair,
	capturePolicy,
	captureSourceFingerprint,
	captureVector,
	samePair,
	samePolicy,
	sameSourceFingerprint,
	sameVector
} from './tiny-texture-state-fingerprint-core.js';

const HEIGHT_DEFAULT = [-10000, 10000];
const SLOPE_DEFAULT = [0, 1];
const ZONE_DEFAULT = [1, 1, 1, 1];

export function captureLayerFingerprints(material = {}) {
	const layers = material.textureLayers || [];
	return {
		layers,
		records: layers.map(layer => captureLayer(layer))
	};
}

export function sameLayerFingerprints(fingerprint, material = {}) {
	const layers = material.textureLayers || [];
	if (fingerprint.layers !== layers || fingerprint.records.length !== layers.length) {
		return false;
	}
	return fingerprint.records.every((record, index) => {
		return sameLayer(record, layers[index] || {});
	});
}

function captureLayer(layer = {}) {
	return {
		angle: numeric(layer.angle, 0),
		height: captureVector(layer.height, 2, HEIGHT_DEFAULT),
		image: captureSourceFingerprint(layer.image),
		layer,
		policy: capturePolicy(layer.texturePolicy),
		repeat: capturePair(layer.repeat, [1, 1]),
		role: layer.role || '',
		slope: captureVector(layer.slope, 2, SLOPE_DEFAULT),
		strength: numeric(layer.strength, 0),
		wetness: numeric(layer.wetness, 0),
		zones: captureVector(layer.zones, 4, ZONE_DEFAULT)
	};
}

function sameLayer(record, layer) {
	return record.layer === layer
		&& record.angle === numeric(layer.angle, 0)
		&& record.role === (layer.role || '')
		&& record.strength === numeric(layer.strength, 0)
		&& record.wetness === numeric(layer.wetness, 0)
		&& sameSourceFingerprint(record.image, layer.image)
		&& samePair(record.repeat, layer.repeat, [1, 1])
		&& samePolicy(record.policy, layer.texturePolicy)
		&& sameVector(record.zones, layer.zones, ZONE_DEFAULT)
		&& sameVector(record.slope, layer.slope, SLOPE_DEFAULT)
		&& sameVector(record.height, layer.height, HEIGHT_DEFAULT);
}

function numeric(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
