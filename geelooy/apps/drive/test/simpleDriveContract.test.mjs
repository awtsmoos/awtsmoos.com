//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Locks the files-first `/apps/drive/` architecture before browser proof begins.
 * @description The Awtsmoos gives every vessel a boundary and every boundary a purpose;
 * Awtsmoos.com keeps primary Drive small, modular, automatic, and free of dashboard surplus.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const drive = path.resolve(here, '..');
const forbidden = /Files become worlds|Enter an alias|Website Maker|Mission Control|Project Platform|Builder|drive-builder|upload-progress|metadata-dialog/i;
const primaryFiles = [
	'index.html',
	'js/app.js',
	'js/views/DriveShellMount.js',
	'js/views/DriveChromeMount.js',
	'js/views/DriveAccountMount.js',
	'js/views/DriveWorkspaceMount.js',
	'js/views/DriveUtilityMount.js',
	'js/views/DriveEntryMenu.js',
	'js/views/DriveDetailsPane.js',
	'js/views/DriveUploadQueue.js',
	'js/orchestration/YesodEntryActionRouter.js',
	'js/orchestration/NetzachUploadStreamController.js'
];

function read(relative) {
	return fs.readFileSync(path.join(drive, relative), 'utf8');
}

test('primary route is one tiny files-first v5 shell', () => {
	const html = read('index.html');
	assert.match(html, /id="drive-root"/);
	assert.match(html, /styles\/drive-v5\.css/);
	assert.match(html, /js\/app\.js/);
	assert.doesNotMatch(html, forbidden);
	assert.equal((html.match(/stylesheet/g) || []).length, 1);
});

test('primary product exposes human file verbs without infrastructure copy', () => {
	const source = primaryFiles.map(read).join('\n');
	for (const phrase of ['Search files and folders', 'Upload', 'New folder', 'My Drive', 'Shared', 'Recent', 'Trash', 'Details']) {
		assert(source.includes(phrase), phrase);
	}
	assert.match(source, /Make public/);
	assert.match(source, /Public link copied/);
	assert.doesNotMatch(source, forbidden);
});

test('one v5 manifest owns the primary cascade including controls', () => {
	const manifest = read('styles/drive-v5.css');
	for (const owner of ['tokens', 'shell', 'browser', 'glyphs', 'controls', 'overlays', 'mobile']) {
		assert(manifest.includes(`drive-v5-${owner}.css`), owner);
	}
	assert(!manifest.includes('dashboard'));
	assert(!manifest.includes('builder'));
});

test('identity and private/public file behavior remain grounded in real contracts', () => {
	assert.match(read('js/driveIdentity.js'), /aliasIdentity/);
	const router = read('js/orchestration/YesodEntryActionRouter.js');
	assert.match(router, /getEntryContent/);
	assert.match(router, /new Blob/);
	assert.match(read('js/actions.js'), /visibility: 'public'/);
});

test('upload testimony forwards real per-file bytes and real desktop drag intent', () => {
	const uploads = read('js/uploads.js');
	assert.match(uploads, /fileTransferredBytes/);
	assert.match(uploads, /fileBytes/);
	assert.match(uploads, /document, 'dragenter'/);
	assert.match(read('styles/v5/controls-feedback.css'), /is-dragging/);
});

test('Home Grid List Details and responsive navigation share one entry truth', () => {
	const renderer = read('js/views/DriveBrowserRenderer.js');
	const navigation = read('js/views/DriveNavigationController.js');
	const modes = read('js/views/DriveViewModeController.js');
	assert.match(renderer, /mode === 'home'/);
	assert.match(renderer, /mode === 'list'/);
	assert.match(renderer, /else host\.append\(this\.grid\(presented\)\)/);
	assert.match(modes, /'home', 'grid', 'list'/);
	assert.match(navigation, /data-drive-nav/);
	assert.match(modes, /compact.*wide|wide.*compact/s);
});

test('focused primary owners remain within the modular line budget', () => {
	for (const root of ['js/views', 'js/orchestration', 'styles/v5']) {
		for (const file of walk(path.join(drive, root))) {
			if (!/\.(?:js|css)$/.test(file)) continue;
			const lines = fs.readFileSync(file, 'utf8').split('\n').length;
			assert(lines <= 121, `${path.relative(drive, file)} has ${lines} physical lines`);
		}
	}
});

function walk(root) {
	return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
		const absolute = path.join(root, entry.name);
		return entry.isDirectory() ? walk(absolute) : [absolute];
	});
}
