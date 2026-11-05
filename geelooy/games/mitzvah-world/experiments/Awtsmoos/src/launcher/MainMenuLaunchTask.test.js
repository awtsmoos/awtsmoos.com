// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchTask.test.js
 * @description Proves the real launch transaction carries its own witness into the essential gate:
 * a handler whose foundation stage reports progress and then starves — the loaded-device shape in
 * which terrain generation is still crossing — keeps spawn terrain alive past its fifteen-second
 * silence deadline on the crossing's testified stage, and the fact is condemned under its original
 * name only once the crossing's own thirty-second stall law is exhausted.
 * The Awtsmoos gives every doorway a measure without confusing slowness with death.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot
} from '../app/MitzvahWorldEssentialBoot.js';
import { createEssentialTestEnvironment } from '../app/MitzvahWorldEssentialTestEnvironment.js';
import { runMainMenuLaunch } from './MainMenuLaunchTask.js';

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

test('a starved crossing renews terrain on its witnessed stage, then fails honestly past its stall law', async () => {
	const environment = createEnvironment();
	let release;
	const gate = new Promise(resolve => { release = resolve; });
	const handler = selection => {
		selection.onProgress({ stage: 'foundation-runtime-chunk', url: 'https://example.test/foundation.compact.js' });
		completeMitzvahWorldEssentialMilestone(environment, RENDERER, { importerStage: 'webgl-boot-frame' });
		return gate;
	};
	const launched = runMainMenuLaunch(handler, { mode: 'solo', onProgress: () => {} }, {
		environment,
		paintSchedule: resolve => resolve(),
		timeoutMs: 30000
	});
	await new Promise(resolve => setImmediate(resolve));
	await new Promise(resolve => setImmediate(resolve));
	let snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	environment.advance(15000);
	environment.fireTimeout();
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[TERRAIN].importerStage, 'foundation-runtime-chunk');
	assert.equal(snapshot.milestones[TERRAIN].launchProofCount, 1);
	assert.equal(snapshot.stalledMilestone, null);
	environment.advance(16000);
	environment.fireTimeout();
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'timed-out');
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT');
	assert.equal(snapshot.milestones[CHOSSID].status, 'pending');
	assert.ok(environment.document.getElementById(FAILURE_ID));
	release('world');
	assert.equal(await launched, 'world');
});
