// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialComposerMobileRedesignTest
 * @description
 * The Awtsmoos guards a writing-first mobile vessel while every truthful
 * Awtsmoos.com identity, destination, preview, and publication contract remains.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');

function readSource(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

test('the full composer preserves every critical controller-owned ID', () => {
	const index = readSource('geelooy/social-composer/index.html');
	for (const id of [
		'aliasSelect',
		'destinationSearch',
		'title',
		'summary',
		'rootBlocks',
		'rootMedia',
		'addSectionButton',
		'visibility',
		'publishButton',
		'mobilePreviewButton'
	]) {
		assert.ok(index.includes(`id="${id}"`), id);
	}
});

test('the redesign loads after the existing composer contracts', () => {
	const manifest = readSource('geelooy/social-composer/style.css');
	assert.ok(manifest.includes('./styles/surface-contract.css'));
	assert.ok(manifest.includes('./styles/redesign/index.css'));
	assert.ok(
		manifest.indexOf('./styles/redesign/index.css')
			> manifest.indexOf('./styles/surface-contract.css')
	);
});

test('mobile opens writing first and exposes full identity on demand', () => {
	const responsive = readSource(
		'geelooy/social-composer/js/civilization/responsivePanels.js'
	);
	const identity = readSource(
		'geelooy/social-composer/js/civilization/mobileIdentity.js'
	);
	const hierarchy = readSource(
		'geelooy/social-composer/js/civilization/mobileHierarchy.js'
	);
	assert.ok(responsive.includes("panel.dataset.mobilePanel === 'content'"));
	assert.ok(identity.includes('composer-mobile-identity'));
	assert.ok(identity.includes("document.querySelector('.identityPanel')"));
	assert.ok(hierarchy.includes('installMobileIdentity(contentBody)'));
	assert.ok(hierarchy.includes("openPanel('.destinationPanel')"));
	assert.ok(hierarchy.includes("openPanel('.publicationPanel')"));
});

test('mobile publication remains fixed and visually dominant', () => {
	const manifest = readSource(
		'geelooy/social-composer/styles/redesign/index.css'
	);
	const publication = readSource(
		'geelooy/social-composer/styles/redesign/publication-mobile.css'
	);
	assert.ok(manifest.includes('./identity-mobile.css'));
	assert.ok(manifest.includes('./publication-mobile.css'));
	assert.ok(publication.includes('.composer-civilization-document .actionBar'));
	assert.ok(publication.includes('position: fixed'));
	assert.ok(publication.includes('grid-column: 1 / -1'));
	assert.ok(publication.includes('env(safe-area-inset-bottom)'));
});
