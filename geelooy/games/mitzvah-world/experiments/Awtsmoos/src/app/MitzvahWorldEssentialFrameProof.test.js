// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialFrameProof.test.js
 * @description Proves the first-frame gate in a requestAnimationFrame-starved vessel: at its deadline the gate
 * drives one genuine frame through the registered prover, still fails honestly when no frame can be produced,
 * and lets a late genuine proof clear a silence verdict — while witnessed failures and the hard horizon stay sealed.
 * The Awtsmoos never calls an unpainted vessel painted; Awtsmoos.com therefore reads the proof from the GPU's
 * own readback, and a timeout remains a statement about missing evidence rather than a life sentence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	failMitzvahWorldEssentialMilestone,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot,
	registerMitzvahWorldEssentialFrameProver,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';
import { scheduleMainMenuWebGlPrewarm } from '../launcher/MainMenuWebGlPrewarm.js';
import { proveMainMenuWebGlFirstFrame } from '../launcher/MainMenuWebGlFirstFrameProof.js';

const ENTRY = ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED;
const RENDERER = ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME;
const TERRAIN = ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS;
const CHOSSID = ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED;
const FAILURE_ID = 'mitzvah-world-essential-failure';
const PROOF_RECEIPT = Object.freeze({
	importerStage: 'main-menu-webgl-frame-proof',
	resourceStatus: 'first-frame-proved-800x600',
	resourceUrl: 'https://example.test/games/mitzvah-world/'
});

class FakeElement {
	constructor(tag, owner) {
		this.tagName = tag;
		this.ownerDocument = owner;
		this.children = [];
		this.style = {};
		this.parent = null;
		this.ownText = '';
		this.id = '';
	}
	set textContent(value) { this.ownText = String(value); this.children = []; }
	get textContent() { return this.ownText + this.children.map(child => child.textContent).join(''); }
	appendChild(child) {
		child.parent = this;
		this.children.push(child);
		if (child.id) this.ownerDocument.byId.set(child.id, child);
		return child;
	}
	setAttribute() {}
	addEventListener() {}
	remove() {
		if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
		if (this.ownerDocument.byId.get(this.id) === this) this.ownerDocument.byId.delete(this.id);
	}
}

function createEnvironment() {
	const environment = createEssentialTestEnvironment();
	const byId = new Map();
	const document = {
		byId,
		body: null,
		createElement: tag => new FakeElement(tag, document),
		getElementById: id => byId.get(id) || null
	};
	document.body = new FakeElement('body', document);
	environment.document = document;
	environment.location = { href: 'https://example.test/games/mitzvah-world/' };
	return environment;
}

function fakeGl(readback = null) {
	const state = { cleared: null, lost: false };
	const gl = {
		COLOR_BUFFER_BIT: 0x4000,
		DEPTH_BUFFER_BIT: 0x0100,
		DEPTH_TEST: 0x0B71,
		RGBA: 0x1908,
		UNSIGNED_BYTE: 0x1401,
		drawingBufferWidth: 800,
		drawingBufferHeight: 600,
		clearColor(red, green, blue, alpha) { state.cleared = [red, green, blue, alpha]; },
		clearDepth() {},
		enable() {},
		clear() {},
		flush() {},
		isContextLost() { return state.lost; },
		readPixels(x, y, width, height, format, type, out) {
			out.set(readback || state.cleared.map(channel => Math.round(channel * 255)));
		}
	};
	return { gl, state };
}

function fakeCanvas(gl) {
	return {
		height: 600,
		width: 800,
		getContext(name) { return name === 'webgl' ? gl : null; }
	};
}

test('deadline drives the registered proof and completes first frame without any animation frame', () => {
	const environment = createEnvironment();
	assert.equal(environment.requestAnimationFrame, undefined);
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	let proverCalls = 0;
	registerMitzvahWorldEssentialFrameProver(environment, () => {
		proverCalls += 1;
		return PROOF_RECEIPT;
	});
	environment.advance(15000);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(proverCalls, 1);
	assert.equal(snapshot.milestones[RENDERER].status, 'complete');
	assert.equal(snapshot.milestones[RENDERER].importerStage, 'main-menu-webgl-frame-proof');
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(environment.document.getElementById(FAILURE_ID), null);
	assert.notEqual(environment.activeTimer(), null);
});

test('menu warmup arms a prover whose genuine GPU frame satisfies the gate end to end', () => {
	const environment = createEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	const { gl, state } = fakeGl();
	scheduleMainMenuWebGlPrewarm(fakeCanvas(gl), environment);
	environment.advance(15000);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.deepEqual(state.cleared, [0.05, 0.09, 0.16, 1]);
	assert.equal(snapshot.milestones[RENDERER].status, 'complete');
	assert.equal(snapshot.milestones[RENDERER].importerStage, 'main-menu-webgl-frame-proof');
	assert.equal(snapshot.stalledMilestone, null);
});

test('a prover that produces nothing — or throws — leaves the honest timeout failure standing', () => {
	for (const prover of [() => null, () => { throw new Error('GPU denied'); }]) {
		const environment = createEnvironment();
		initializeMitzvahWorldEssentialBoot(environment);
		completeMitzvahWorldEssentialMilestone(environment, ENTRY);
		let proverCalls = 0;
		registerMitzvahWorldEssentialFrameProver(environment, () => {
			proverCalls += 1;
			return prover();
		});
		environment.advance(15000);
		environment.fireTimeout();
		const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
		assert.equal(proverCalls, 1);
		assert.equal(snapshot.milestones[RENDERER].status, 'timed-out');
		assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_RENDERER_FIRST_FRAME_TIMEOUT');
		const panel = environment.document.getElementById(FAILURE_ID);
		assert.ok(panel);
		assert.match(panel.textContent, /ESSENTIAL_RENDERER_FIRST_FRAME_TIMEOUT/);
	}
});

test('late genuine completion revives a timed-out fact and clears the failure panel', () => {
	const environment = createEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	environment.advance(15001);
	environment.fireTimeout();
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).milestones[RENDERER].status, 'timed-out');
	assert.ok(environment.document.getElementById(FAILURE_ID));
	const revived = completeMitzvahWorldEssentialMilestone(environment, RENDERER, {
		importerStage: 'webgl-boot-frame'
	});
	assert.equal(revived.milestones[RENDERER].status, 'complete');
	assert.equal(revived.milestones[RENDERER].failureCode, null);
	assert.equal(revived.stalledMilestone, null);
	assert.equal(environment.document.getElementById(FAILURE_ID), null);
	assert.notEqual(environment.activeTimer(), null);
	updateMitzvahWorldEssentialMilestone(environment, TERRAIN, { importerStage: 'bootstrap-world-foundation' });
	updateMitzvahWorldEssentialMilestone(environment, CHOSSID, { importerStage: 'canonical-validation' });
	completeMitzvahWorldEssentialMilestone(environment, TERRAIN);
	completeMitzvahWorldEssentialMilestone(environment, CHOSSID);
	const certified = completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED);
	assert.equal(certified.certified, true);
});

test('the hard first-play timeout and witnessed failures stay sealed against late completion', () => {
	const environment = createEnvironment();
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	for (const time of [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000]) {
		environment.advance(time - environment.performance.now());
		updateMitzvahWorldEssentialMilestone(environment, RENDERER, { importerStage: 'renderer-alive' });
		updateMitzvahWorldEssentialMilestone(environment, TERRAIN, { importerStage: 'terrain-alive' });
		updateMitzvahWorldEssentialMilestone(environment, CHOSSID, { importerStage: 'chossid-alive' });
	}
	environment.advance(90000 - environment.performance.now());
	environment.fireTimeout();
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).stalledMilestone.failureCode, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT');
	completeMitzvahWorldEssentialMilestone(environment, RENDERER, { importerStage: 'too-late' });
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).milestones[RENDERER].status, 'timed-out');

	const witnessed = createEnvironment();
	initializeMitzvahWorldEssentialBoot(witnessed);
	completeMitzvahWorldEssentialMilestone(witnessed, ENTRY);
	failMitzvahWorldEssentialMilestone(witnessed, RENDERER, {
		failureCode: 'WEBGL_UNAVAILABLE',
		failureMessage: 'Browser did not provide the required WebGL context.'
	});
	completeMitzvahWorldEssentialMilestone(witnessed, RENDERER, { importerStage: 'too-late' });
	assert.equal(getMitzvahWorldEssentialBootSnapshot(witnessed).milestones[RENDERER].status, 'failed');
});

test('registration without a living ledger arms nothing and starts no gate', () => {
	const environment = createEnvironment();
	assert.equal(registerMitzvahWorldEssentialFrameProver(environment, () => PROOF_RECEIPT), null);
	assert.equal(environment.AwtsmoosMitzvahWorldEssentialBoot, undefined);
	assert.equal(environment.activeTimer(), null);
});

test('the canvas proof testifies only from a real cleared-and-read-back frame', () => {
	const { gl, state } = fakeGl();
	const receipt = proveMainMenuWebGlFirstFrame(fakeCanvas(gl), createEnvironment());
	assert.equal(receipt.importerStage, 'main-menu-webgl-frame-proof');
	assert.equal(receipt.resourceStatus, 'first-frame-proved-800x600');
	assert.deepEqual(state.cleared, [0.05, 0.09, 0.16, 1]);

	const mismatch = fakeGl([0, 0, 0, 255]);
	assert.equal(proveMainMenuWebGlFirstFrame(fakeCanvas(mismatch.gl), createEnvironment()), null);
	const lost = fakeGl();
	lost.state.lost = true;
	assert.equal(proveMainMenuWebGlFirstFrame(fakeCanvas(lost.gl), createEnvironment()), null);
	const zero = fakeGl();
	zero.gl.drawingBufferWidth = 0;
	assert.equal(proveMainMenuWebGlFirstFrame({ width: 0, height: 600, getContext: () => zero.gl }, createEnvironment()), null);
	assert.equal(proveMainMenuWebGlFirstFrame({ width: 800, height: 600, getContext: () => null }, createEnvironment()), null);
	assert.equal(proveMainMenuWebGlFirstFrame(null, createEnvironment()), null);
});
