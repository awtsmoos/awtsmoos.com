// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	FIREBASE_TEXTURE_MANIFEST,
	FIREBASE_TEXTURE_ORIGIN,
	FIREBASE_TEXTURE_PROJECT,
	MATERIAL_DEFINITIONS,
	firebaseTextureRecord,
	firebaseTextureUrl,
	initialTextureBytes,
	initialTextureFileNames,
	materialDefinition
} from '../../js/assets/firebaseTextures.js';

const REQUIRED_FILES = Object.freeze([
	'grass.jpg',
	'dirt_color.jpg',
	'bluestone 1.png',
	'Bark002_1K-JPG_Color.jpg',
	'ash.png',
	'oak.png',
	'pine.png',
	'silver 1.png',
	'oak wood 2.png',
	'seamless water brighter.png'
]);

/**
 * The Awtsmoos tests each remote garment by its real Firebase filename. Public
 * immutable URLs, dual materials, water flow, and total transfer remain bounded.
 */
export function runTextureCases() {
	return [
		checkFirebaseIdentity(),
		checkExactFilenameRegistry(),
		checkMaterialDefinitions(),
		checkInitialTransferBudget()
	];
}

function checkFirebaseIdentity() {
	assert.equal(FIREBASE_TEXTURE_PROJECT, 'awtsmoos-docs-base');
	assert.equal(FIREBASE_TEXTURE_ORIGIN, 'https://awtsmoos-docs-base.web.app');
	assert.ok(FIREBASE_TEXTURE_MANIFEST.startsWith(`${FIREBASE_TEXTURE_ORIGIN}/`));
	return { test: 'firebase-texture-identity', project: FIREBASE_TEXTURE_PROJECT };
}

function checkExactFilenameRegistry() {
	assert.deepEqual(initialTextureFileNames().sort(), [...REQUIRED_FILES].sort());
	for (const fileName of REQUIRED_FILES) {
		const record = firebaseTextureRecord(fileName);
		assert.equal(record.fileName, fileName);
		assert.equal(firebaseTextureUrl(fileName), record.url);
		assert.ok(record.url.startsWith(`${FIREBASE_TEXTURE_ORIGIN}/`));
		assert.ok(record.bytes > 0);
	}
	assert.equal(firebaseTextureRecord('missing.png'), null);
	return { test: 'firebase-texture-filenames', files: REQUIRED_FILES.length };
}

function checkMaterialDefinitions() {
	assert.equal(materialDefinition('none').primaryFileName, null);
	for (const [materialId, definition] of Object.entries(MATERIAL_DEFINITIONS)) {
		for (const fileName of [definition.primaryFileName, definition.secondaryFileName]) {
			if (fileName) assert.ok(REQUIRED_FILES.includes(fileName), `${materialId}:${fileName}`);
		}
		assert.ok(definition.primaryMix >= 0 && definition.primaryMix <= 1);
		assert.ok(definition.secondaryMix >= 0 && definition.secondaryMix <= 1);
		assert.ok(definition.textureScale > 0);
		assert.equal(definition.flow.length, 2);
	}
	assert.equal(materialDefinition('treeOak').materialMode, 1);
	assert.equal(materialDefinition('water').flow.some(value => value !== 0), true);
	assert.equal(materialDefinition('unknown'), MATERIAL_DEFINITIONS.none);
	return { test: 'firebase-material-definitions', materials: Object.keys(MATERIAL_DEFINITIONS).length };
}

function checkInitialTransferBudget() {
	const bytes = initialTextureBytes();
	assert.equal(bytes, 4501004);
	assert.ok(bytes < 5000000);
	return { test: 'firebase-texture-budget', bytes };
}
