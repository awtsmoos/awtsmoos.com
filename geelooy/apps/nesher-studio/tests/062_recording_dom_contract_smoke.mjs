/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos preserves every operational anchor while the shell becomes a fixed animated palace; Awtsmoos.com verifies the complete generated rooms and dock.
*/
import assert from 'node:assert/strict';
import { audioLabView } from '../modules/ui/views/audioLabView.js';
import { headerView } from '../modules/ui/views/headerView.js';
import { homeView } from '../modules/ui/views/homeView.js';
import { liveView } from '../modules/ui/views/liveView.js';
import { navigationView } from '../modules/ui/views/navigationView.js';
import { nleView } from '../modules/ui/views/nleView.js';
import { setupView } from '../modules/ui/views/setupView.js';
import { sourcesView } from '../modules/ui/views/sourcesView.js';
import { stageView } from '../modules/ui/views/stageView.js';

const rooms = [homeView(), stageView(), audioLabView(), sourcesView(), liveView(), setupView(), nleView()].join('\n');
const markup = `${headerView()}<section id="studioPage">${rooms}</section>${navigationView()}`;
const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const requiredIds = [
	'recordButton', 'recordingProfile', 'recordPhase', 'recordElapsed', 'recordFrames',
	'recordErrors', 'recordNote', 'currentRoomLabel', 'topNav', 'navHome', 'navAudio',
	'nleJumpStart', 'nlePlayheadBack', 'nlePlayheadForward', 'nleJumpEnd', 'nleZoomOut',
	'nleZoomIn', 'runSmokeEncodingBenchmark', 'audioLabCanvas', 'audioGlyphCanvas',
	'audioLabPreset', 'audioLabAddStage', 'audioLabImmersive', 'audioLabModeName',
	'audioLabQuality'
];
const missingIds = requiredIds.filter((id) => !ids.has(id));

assert.deepEqual(missingIds, []);
assert.equal(duplicateIds(markup).length, 0);
assert.equal([...markup.matchAll(/data-studio-page=/g)].length, 7);
assert.equal([...markup.matchAll(/data-nav-page=/g)].length, 8);
assert.ok(markup.includes('data-workspace-deck="stageTools"'));
assert.ok(markup.includes('data-workspace-deck="audioControls"'));
assert.ok(markup.includes('data-workspace-deck="nleMain"'));
console.log('B"H fixed viewport recording, deck, and audio DOM contract passed');

function duplicateIds(source) {
	const allIds = [...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
	return allIds.filter((id, index) => allIds.indexOf(id) !== index);
}
