import assert from 'node:assert/strict';
import { createBin } from '../modules/nle/bin.js';
import { createTimeline } from '../modules/nle/timeline.js';
import { bindNleControls } from '../modules/app/nleBindings.js';

function fakeEl() { return { innerHTML:'', textContent:'', onclick:null, closest(){ return null; } }; }
const ids = ['addBinAsset','addTimelineClip','prepareExport','nleBin','nleTimeline','splitClip','trimClipShorter','nudgeClipLeft','nudgeClipRight','moveClipTrack','rippleDeleteClip','duplicateClip','snapClipPrev','snapClipNext','fadeClip','toggleClipMute','toggleClipDisabled','addMarker','nleSelectionSummary','nleExport'];
const dom = Object.fromEntries(ids.map(id => [id, fakeEl()]));
const state = { width:640, height:360, fps:30, bin:createBin(), timeline:createTimeline(), exportPlan:null };
const statuses = [];
bindNleControls({ dom, state, setStatus:text => statuses.push(text) });
const before = state.timeline.tracks[0].clips.length;
dom.duplicateClip.onclick();
assert.equal(state.timeline.tracks[0].clips.length, before + 1);
dom.fadeClip.onclick();
assert.equal(state.timeline.tracks[0].clips.at(-1).fadeIn, 1);
dom.toggleClipMute.onclick();
assert.equal(state.timeline.tracks[0].clips.at(-1).muted, true);
dom.toggleClipDisabled.onclick();
assert.equal(state.timeline.tracks[0].clips.at(-1).disabled, true);
dom.addMarker.onclick();
assert.equal(state.timeline.markers.length, 1);
assert.match(dom.nleTimeline.innerHTML, /marker|muted|disabled|faded|off/);
assert.equal(statuses.some(s => s.includes('Clip duplicated')), true);
console.log('B"H NLE UI commands smoke passed');
