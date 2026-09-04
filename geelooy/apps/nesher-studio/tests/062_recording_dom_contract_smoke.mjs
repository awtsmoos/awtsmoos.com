//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file 062_recording_dom_contract_smoke.mjs
 * @description Verifies recording anchors and professional decks survive inside the current Stage-first AWTSMOOS STUDIO shell without duplicate identities.
 * The Awtsmoos lets a simpler creative face inherit every real recording vessel beneath the light;
 * Awtsmoos.com keeps Record, Timeline, Audio, and deeper decks addressable while the retired room dock leaves sight.
 */
import assert from 'node:assert/strict';
import { audioLabView } from '../modules/ui/views/audioLabView.js';
import { creativeMoreView } from '../modules/ui/views/creativeMoreView.js';
import { headerView } from '../modules/ui/views/headerView.js';
import { homeView } from '../modules/ui/views/homeView.js';
import { intentSheetView } from '../modules/ui/views/intentSheetView.js';
import { liveView } from '../modules/ui/views/liveView.js';
import { nleView } from '../modules/ui/views/nleView.js';
import { primaryIntentBarView } from '../modules/ui/views/primaryIntentBarView.js';
import { setupView } from '../modules/ui/views/setupView.js';
import { sourcesView } from '../modules/ui/views/sourcesView.js';
import { stageView } from '../modules/ui/views/stageView.js';

const markup = [
	headerView(),
	stageView(),
	homeView(),
	audioLabView(),
	sourcesView(),
	liveView(),
	setupView(),
	nleView(),
	creativeMoreView(),
	primaryIntentBarView(),
	intentSheetView()
].join('\n');

assertRequiredRecordingAnchors();
assertWorkspaceContract();
assertIntentContract();
assertProfessionalDecks();
assertNoDuplicateIds();
console.log('B"H Stage-first recording DOM contract passed');

/** Proves existing recording controls and status anchors remain addressable. */
function assertRequiredRecordingAnchors() {
	for (const id of [
		'recordButton',
		'recordingProfile',
		'recordPhase',
		'recordElapsed',
		'recordFrames',
		'recordErrors',
		'recordNote'
	]) {
		assert.ok(markup.includes(`id="${id}"`), `missing ${id}`);
	}
}

/** Verifies exactly the eight current deeper workspaces and no retired navigation dock. */
function assertWorkspaceContract() {
	const pages = [...markup.matchAll(/data-studio-page="([^"]+)"/g)]
		.map((match) => match[1]);
	assert.deepEqual(
		pages.sort(),
		['audio', 'home', 'live', 'more', 'nle', 'setup', 'sources', 'stage']
	);
	assert.equal(markup.includes('nav-dock'), false);
	assert.equal(markup.includes('data-nav-page='), false);
}

/** Verifies the persistent beginner intent vocabulary remains mounted beside the workspaces. */
function assertIntentContract() {
	for (const id of [
		'intentCreateButton',
		'intentEditButton',
		'intentTimelineButton',
		'intentAnimateButton',
		'intentMoreButton',
		'intentSheet'
	]) {
		assert.ok(markup.includes(`id="${id}"`), `missing ${id}`);
	}
}

/** Preserves the professional Stage, Audio, and NLE deck identities used by existing controllers. */
function assertProfessionalDecks() {
	for (const deck of ['stageTools', 'audioControls', 'nleMain']) {
		assert.ok(markup.includes(`data-workspace-deck="${deck}"`), `missing ${deck}`);
	}
}

/** Ensures modular view composition did not introduce ambiguous DOM identities. */
function assertNoDuplicateIds() {
	const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
	assert.equal(new Set(ids).size, ids.length, 'duplicate DOM id found');
}
