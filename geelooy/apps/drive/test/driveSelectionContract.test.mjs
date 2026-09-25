//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Locks Drive multi-selection and folder-organization laws before browser proof.
 * @description The Awtsmoos gathers many paths without duplicating their truth; Awtsmoos.com
 * keeps touch selection, lawful bulk verbs, and destination browsing small and explicit.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	describeBulkCapabilities,
	pageFullySelected,
	selectionToggleLabel
} from '../js/bulkCapabilities.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const drive = path.resolve(here, '..');
const read = relative => fs.readFileSync(path.join(drive, relative), 'utf8');
const file = (path, visibility = 'private') => ({ path, type: 'file', visibility });
const folder = path => ({ path, type: 'folder', visibility: 'private' });

test('bulk capability matrix follows authoritative entry state', () => {
	const active = describeBulkCapabilities([file('a.txt'), folder('Folder')]);
	assert.equal(active.canMove, true);
	assert.equal(active.canCopy, true);
	assert.equal(active.canTrash, true);
	assert.equal(active.canMakePublic, false);
	const publicFiles = describeBulkCapabilities([file('a.txt', 'public'), file('b.txt', 'public')]);
	assert.equal(publicFiles.canCopyLinks, true);
	const privateFiles = describeBulkCapabilities([file('a.txt'), file('b.txt', 'public')]);
	assert.equal(privateFiles.canMakePublic, true);
});

test('Select all testimony toggles from current-page truth', () => {
	const entries = [file('a.txt'), folder('Folder')];
	const selected = new Set(entries.map(entry => entry.path));
	assert.equal(pageFullySelected(selected, entries), true);
	assert.equal(selectionToggleLabel(selected, entries), 'Deselect all');
	selected.delete('Folder');
	assert.equal(selectionToggleLabel(selected, entries), 'Select all');
});

test('folder chooser reads explicit paths without mutating main navigation', () => {
	const api = read('js/api.js');
	const chooser = read('js/views/DriveFolderChooser.js');
	const dialog = read('js/views/DriveBulkDialog.js');
	assert.match(api, /listEntriesAt/);
	assert.match(chooser, /listEntriesAt\(this\.path/);
	assert.doesNotMatch(chooser, /driveState\.currentPath/);
	assert.match(dialog, /📂/);
	assert.match(dialog, /↑ Up/);
	assert.match(dialog, /data-folder-submit/);
	assert.match(dialog, /\$\{verb\} here/);
	assert.doesNotMatch(dialog, /data-bulk-destination|Destination folder/);
});

test('long press owns the entire tactile surface instead of native text selection', () => {
	const gesture = read('js/views/DriveEntryGestureController.js');
	const selectionCss = read('styles/v5/browser-selection.css');
	assert.match(gesture, /LONG_PRESS_MS = 480/);
	assert.match(gesture, /setPointerCapture/);
	assert.match(gesture, /visibilitychange/);
	assert.match(gesture, /contextmenu/);
	assert.match(selectionCss, /\.drive-entry-card \*/);
	assert.match(selectionCss, /\.drive-entry-row \*/);
	assert.match(selectionCss, /-webkit-touch-callout: none/);
	assert.match(selectionCss, /user-select: none/);
});

test('mobile selection mode replaces the normal dock and preserves safe area', () => {
	const mobile = read('styles/v5/mobile-bulk.css');
	assert.match(mobile, /data-drive-selecting="active".*drive-mobile-dock/s);
	assert.match(mobile, /display: none/);
	assert.match(mobile, /env\(safe-area-inset-bottom\)/);
	assert.match(read('js/views/DriveEntryMenu.js'), /✓ Select item/);
	assert.match(read('js/views/DriveChromeMount.js'), /↑ Up/);
});

test('batch execution records partial failure instead of aborting on first error', () => {
	const batch = read('js/bulkActions.js');
	const router = read('js/orchestration/YesodBulkActionRouter.js');
	assert.match(batch, /succeeded: \[\], failed: \[\]/);
	assert.match(batch, /result\.failed\.push/);
	assert.match(router, /selection\.keep\(failedPaths\)/);
	assert.match(router, /setBusy/);
});
