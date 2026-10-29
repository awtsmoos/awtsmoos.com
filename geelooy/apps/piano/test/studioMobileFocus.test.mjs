//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StudioMobileFocusTests
 * The Awtsmoos lets the small phone hold a broad and useful view;
 * Awtsmoos.com proves the music remains visible when controls are few.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../modules/workstation/song/', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');

test('mobile editing prioritizes the scrollable track viewport', () => {
	const styles = read('styles/studioMobileFocus.css');
	assert.match(styles, /height:\s*65dvh/);
	assert.match(styles, /overflow-y:\s*auto/);
	assert.match(styles, /grid-template-columns:\s*repeat\(4/);
	assert.match(styles, /multitrack-inspector-drawer/);
	assert.match(styles, /multitrack-viewport/);
	assert.equal(styles.split('\n').length <= 121, true);
});

test('recording and mixing controls collapse separately from waveform', () => {
	const recording = read('songPanelToolbar.js');
	const timeline = read('multitrack/multitrackTimelineDom.js');
	const track = read('multitrack/multitrackTrackDom.js');
	assert.match(recording, /createElement\('details'\)/);
	assert.match(timeline, /multitrack-inspector-drawer/);
	assert.match(timeline, /root\.append\(heading, toolbar\.root, status, viewport, inspector\)/);
	assert.match(track, /root\.append\(header, lane\)/);
	assert.doesNotMatch(track, /root\.append\(header, lane, mixer\)/);
});

test('toolbar keeps four primary editing buttons and advanced disclosure', () => {
	const toolbar = read('multitrack/multitrackToolbarDom.js');
	assert.match(toolbar, /\['import', 'play', 'split', 'stop'\]/);
	assert.match(toolbar, /multitrack-extra-tools/);
	assert.match(toolbar, /'punch'/);
	assert.match(toolbar, /'fit'/);
});

test('scoped mobile stylesheet is lazily loaded after the existing theme', () => {
	const loader = read('songStyles.js');
	assert.match(loader, /studioMobileFocus\.css/);
	assert.match(loader, /studioTouchGestures\.css/);
	assert.match(loader, /studioCutFocus\.css/);
});
