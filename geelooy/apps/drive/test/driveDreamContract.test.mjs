//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Locks the premium mobile-first Drive realization to truthful production contracts.
 * @description The Awtsmoos lets beauty become a vessel for truth; Awtsmoos.com keeps the dream
 * rich without inventing filesystem powers, collaborators, favorites, or transport controls.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const drive = path.resolve(here, '..');
const read = relative => fs.readFileSync(path.join(drive, relative), 'utf8');

test('premium chrome exposes the new mobile-first identity and truthful destinations', () => {
	const chrome = read('js/views/DriveChromeMount.js');
	const utility = read('js/views/DriveUtilityMount.js');
	assert.match(chrome, /Awtsmoos <strong>Drive<\/strong>/);
	assert.match(chrome, /Your files\. A bigger world\. ✦/);
	assert.match(chrome, /Search files, folders, and more/);
	assert.match(chrome, /data-drive-nav="shared">◉ Public/);
	assert.match(utility, /<span>Public<\/span>/);
	for (const category of ['all', 'folders', 'images', 'videos', 'docs']) assert.match(chrome, new RegExp(`data-drive-category="${category}"`));
});

test('dream presentation remains one authoritative Drive collection', () => {
	const renderer = read('js/views/DriveBrowserRenderer.js');
	const category = read('js/views/DriveCategoryController.js');
	assert.match(renderer, /driveState/);
	assert.match(renderer, /categories\?\.filter\(presented\)/);
	assert.doesNotMatch(category, /driveState\.entries\s*=/);
	assert.match(category, /items\.filter/);
	assert.match(category, /item\.kind === 'image'/);
	assert.match(category, /item\.kind === 'video'/);
});

test('Home is folder-first and rich files reveal explicit visibility testimony', () => {
	const home = read('js/views/DriveHomeRenderer.js');
	const badge = read('js/views/DriveVisibilityBadge.js');
	assert.match(home, /section\('Folders'/);
	assert.match(home, /section\('Files'/);
	assert.match(home, /drive-folder-rail/);
	assert.match(read('js/views/DriveEntryCard.js'), /createDriveVisibilityBadge/);
	assert.match(read('js/views/DriveEntryListRow.js'), /createDriveVisibilityBadge/);
	assert.match(badge, /Public/);
	assert.match(badge, /Private/);
});

test('folder personality and public previews use derived truth', () => {
	const presenter = read('js/views/DriveEntryPresenter.js');
	const folder = read('js/views/DriveFolderCard.js');
	assert.match(presenter, /folderTone/);
	assert.match(presenter, /FOLDER_TONES/);
	assert.match(presenter, /kind !== 'image' \|\| entry\.visibility !== 'public'/);
	assert.match(folder, /📁/);
	assert.doesNotMatch(folder, /itemCount|childrenCount|fileCount/);
});

test('upload command center is derived only from measured queue bytes', () => {
	const summary = read('js/views/DriveUploadSummary.js');
	assert.match(summary, /transferredBytes/);
	assert.match(summary, /totalBytes/);
	assert.match(summary, /Math\.round\(\(transferredBytes \/ totalBytes\) \* 100\)/);
	assert.match(read('js/views/DriveUploadQueue.js'), /createDriveUploadSummary/);
	assert.doesNotMatch(summary, /createElement\(['"]button/);
	assert.doesNotMatch(summary, /data-upload-action/);
});

test('Move and Copy chooser exposes count-aware real-folder commitment', () => {
	const dialog = read('js/views/DriveBulkDialog.js');
	assert.match(dialog, /driveSelectionCount/);
	assert.match(dialog, /\$\{verb\} here\$\{suffix\}/);
	assert.match(dialog, /Create new folder/);
	assert.match(dialog, /↑ Up/);
});

test('concept-only powers stay absent from primary production UI', () => {
	const source = ['DriveChromeMount.js', 'DriveUtilityMount.js', 'DriveEntryCard.js', 'DriveBulkDialog.js']
		.map(name => read(`js/views/${name}`)).join('\n');
	assert.doesNotMatch(source, /Starred|Editor|Viewer|Commenter|Tags|Pause upload|Cancel upload|Shared with me/);
});
