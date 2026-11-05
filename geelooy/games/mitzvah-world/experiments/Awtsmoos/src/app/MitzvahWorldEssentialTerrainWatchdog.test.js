// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialTerrainWatchdog.test.js
 * @description Proves the launch-gated facts are judged by their launch's testimony: a crossing in flight
 * inside its own stall law renews spawn terrain with the witnessed stage instead of dying at fifteen
 * seconds; testimony ends exactly when the stall law is exhausted, when the crossing settles, or when a
 * witness counterfeits its evidence — and the honest ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT stands.
 * The whole first-play hard horizon seals even a lively crossing, while a genuine late terrain still
 * revives a silence verdict, because a timeout names missing evidence and never a broken vessel.
 * The Awtsmoos measures the doorway by the traveler's footsteps, not by the silence of the road behind him.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot,
	registerMitzvahWorldEssentialLaunchWitness,
	registerMitzvahWorldEssentialMenuWitness
} from './MitzvahWorldEssentialBoot.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';

const ENTRY = ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED;
const RENDERER = ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME;
const TERRAIN = ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS;
const CHOSSID = ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED;
const FAILURE_ID = 'mitzvah-world-essential-failure';

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
	environment.location = { href: 'https://example.test/games/mitzvahWorld/' };
	return environment;
}

/** Opens a launch-shaped ledger: entry done, renderer already certified by its phase, terrain awaited. */
function openLaunchLedger(environment) {
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	completeMitzvahWorldEssentialMilestone(environment, RENDERER, { importerStage: 'webgl-boot-frame' });
}

function testimonyWitness(state) {
	return () => state.progressAt === null ? null : {
		importerStage: 'foundation-runtime-chunk',
		lastProgressAtMilliseconds: state.progressAt,
		stallBudgetMilliseconds: 30000
	};
}

test('a crossing in flight inside its stall law renews terrain with the witnessed stage', () => {
	const environment = createEnvironment();
	openLaunchLedger(environment);
	const state = { progressAt: null };
	registerMitzvahWorldEssentialLaunchWitness(environment, testimonyWitness(state));
	environment.advance(10000);
	state.progressAt = 10000;
	environment.advance(5000);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[TERRAIN].importerStage, 'foundation-runtime-chunk');
	assert.equal(snapshot.milestones[TERRAIN].resourceStatus, 'launch-in-flight');
	assert.equal(snapshot.milestones[TERRAIN].launchProofCount, 1);
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(environment.document.getElementById(FAILURE_ID), null);
	assert.notEqual(environment.activeTimer(), null);
	const completed = completeMitzvahWorldEssentialMilestone(environment, TERRAIN, {
		importerStage: 'bootstrap-world-foundation'
	});
	assert.equal(completed.milestones[TERRAIN].status, 'complete');
});

test('testimony ends when the stall law is exhausted and the honest terrain timeout stands', () => {
	const environment = createEnvironment();
	openLaunchLedger(environment);
	registerMitzvahWorldEssentialLaunchWitness(environment, () => ({
		importerStage: 'foundation-runtime-chunk',
		lastProgressAtMilliseconds: 0,
		stallBudgetMilliseconds: 30000
	}));
	environment.advance(15000);
	environment.fireTimeout();
	let snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[TERRAIN].launchProofCount, 1);
	environment.advance(16000);
	environment.fireTimeout();
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'timed-out');
	assert.equal(snapshot.stalledMilestone.name, TERRAIN);
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT');
	const panel = environment.document.getElementById(FAILURE_ID);
	assert.ok(panel);
	assert.match(panel.textContent, /ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT/);
});

test('settled, absent, throwing, and counterfeit witnesses testify nothing', () => {
	const witnesses = [
		() => null,
		null,
		() => { throw new Error('witness broke'); },
		() => ({ importerStage: 'foundation-runtime-chunk', lastProgressAtMilliseconds: 999999, stallBudgetMilliseconds: 30000 })
	];
	for (const witness of witnesses) {
		const environment = createEnvironment();
		openLaunchLedger(environment);
		if (witness) registerMitzvahWorldEssentialLaunchWitness(environment, witness);
		environment.advance(15001);
		environment.fireTimeout();
		const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
		assert.equal(snapshot.milestones[TERRAIN].status, 'timed-out');
		assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT');
		assert.ok(environment.document.getElementById(FAILURE_ID));
	}
});

test('the hard first-play horizon seals terrain despite ever-fresh testimony', () => {
	const environment = createEnvironment();
	openLaunchLedger(environment);
	completeMitzvahWorldEssentialMilestone(environment, CHOSSID, { importerStage: 'canonical-validation' });
	registerMitzvahWorldEssentialLaunchWitness(environment, () => ({
		importerStage: 'foundation-runtime-chunk',
		lastProgressAtMilliseconds: environment.performance.now(),
		stallBudgetMilliseconds: 30000
	}));
	for (let step = 0; step < 8; step += 1) {
		environment.advance(10000);
		environment.fireTimeout();
	}
	let snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[TERRAIN].launchProofCount, 4);
	environment.advance(10000);
	environment.fireTimeout();
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'timed-out');
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT');
	const late = completeMitzvahWorldEssentialMilestone(environment, TERRAIN, {
		importerStage: 'bootstrap-world-foundation'
	});
	assert.equal(late.milestones[TERRAIN].status, 'timed-out');
	assert.equal(late.milestones[TERRAIN].failureCode, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT');
});

test('a genuine late terrain completion revives its silence verdict and clears the panel', () => {
	const environment = createEnvironment();
	openLaunchLedger(environment);
	environment.advance(15001);
	environment.fireTimeout();
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).milestones[TERRAIN].status, 'timed-out');
	assert.ok(environment.document.getElementById(FAILURE_ID));
	const revived = completeMitzvahWorldEssentialMilestone(environment, TERRAIN, {
		importerStage: 'bootstrap-world-foundation'
	});
	assert.equal(revived.milestones[TERRAIN].status, 'complete');
	assert.equal(revived.milestones[TERRAIN].failureCode, null);
	assert.equal(revived.stalledMilestone, null);
	assert.equal(environment.document.getElementById(FAILURE_ID), null);
});

test('witness registration without a living ledger arms nothing and starts no gate', () => {
	const environment = createEnvironment();
	const witness = () => ({ importerStage: 'foundation-runtime-chunk', lastProgressAtMilliseconds: 0, stallBudgetMilliseconds: 30000 });
	assert.equal(registerMitzvahWorldEssentialLaunchWitness(environment, witness), null);
	assert.equal(registerMitzvahWorldEssentialMenuWitness(environment, witness), null);
	assert.equal(environment.AwtsmoosMitzvahWorldEssentialBoot, undefined);
	assert.equal(environment.activeTimer(), null);
});

test('counterfeit progress evidence is rejected and the silence verdict stands', () => {
	const environment = createEnvironment();
	openLaunchLedger(environment);
	registerMitzvahWorldEssentialLaunchWitness(environment, () => ({
		importerStage: 'foundation-runtime-chunk',
		lastProgressAtMilliseconds: 'not-a-number',
		stallBudgetMilliseconds: 30000
	}));
	environment.advance(15001);
	environment.fireTimeout();
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'timed-out');
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT');
});
