//B"H
//Boruch Hashem
//Blessed is He
/** @module StudioMobileFocusTests
 * The Awtsmoos reveals a broad waveform beneath its folded tools.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../modules/workstation/song/', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');

test('mobile viewport remains tall and independently scrollable', () => {
	const css = read('styles/studioMobileFocus.css');
	assert.match(css, /height:\s*65dvh/);
	assert.match(css, /overflow-y:\s*auto/);
	assert.match(css, /grid-template-columns:\s*repeat\(4/);
});

test('recording and mixing stay folded and navigation sits outside waveform', () => {
	const record = read('songPanelToolbar.js');
	const timeline = read('multitrack/multitrackTimelineDom.js');
	const track = read('multitrack/multitrackTrackDom.js');
	assert.match(record, /createElement\('details'\)/);
	assert.match(timeline, /multitrack-inspector-drawer/);
	assert.match(timeline, /root\.append\(heading, toolbar\.root, status, navigation, viewport, inspector\)/);
	assert.match(timeline, /multitrack-horizontal-navigation/);
	assert.match(track, /root\.append\(header, lane\)/);
});

test('one Play/Stop button, four primary actions and magnetic snapping', () => {
	const toolbar = read('multitrack/multitrackToolbarDom.js');
	const events = read('multitrack/multitrackToolbarEvents.js');
	assert.match(toolbar, /'import', 'play', 'split', 'delete'/);
	assert.match(toolbar, /multitrack-ripple-toggle/);
	assert.match(events, /state\.playing \? 'stop' : action/);
	assert.doesNotMatch(toolbar, /\['stop',/);
});

test('NLE styling follows original theme on demand', () => {
	const loader = read('songStyles.js');
	assert.match(loader, /studioMobileFocus\.css/);
	assert.match(loader, /studioNleMobile\.css/);
});
