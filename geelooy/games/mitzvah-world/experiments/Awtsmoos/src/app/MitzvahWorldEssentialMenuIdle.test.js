// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialMenuIdle.test.js
 * @description Proves the essential gate at the world chooser: while the menu is the live surface and no
 * world launch has been requested, the launch-gated facts (spawn terrain, canonical Chossid) are witnessed
 * as awaiting selection instead of being condemned by their silence clocks — across even the hard horizon —
 * while a chooser that has vanished leaves the honest terrain timeout standing exactly as before.
 * The Awtsmoos does not call an unrequested world unbuilt; Awtsmoos.com lets the living chooser testify that
 * first play has not begun, and believes the testimony only while the chooser truly stands before the player.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot
} from './MitzvahWorldEssentialBoot.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';
import { scheduleMainMenuWebGlPrewarm } from '../launcher/MainMenuWebGlPrewarm.js';

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
	environment.location = { href: 'https://example.test/games/mitzvah-world/' };
	return environment;
}

function fakeGl() {
	const state = { cleared: null };
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
		isContextLost() { return false; },
		readPixels(x, y, width, height, format, type, out) {
			out.set(state.cleared.map(channel => Math.round(channel * 255)));
		}
	};
	return gl;
}

function fakeCanvas(gl) {
	return {
		height: 600,
		width: 800,
		getContext(name) { return name === 'webgl' ? gl : null; }
	};
}

function openChooser(environment, menu) {
	initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(environment, ENTRY);
	scheduleMainMenuWebGlPrewarm(fakeCanvas(fakeGl()), environment, menu);
}

/** Fires the watchdog and any immediately-due successor timers at the current fake instant. */
function fireWatchdog(environment, rounds = 4) {
	for (let round = 0; round < rounds && environment.activeTimer(); round += 1) {
		environment.fireTimeout();
	}
}

test('chooser idle never condemns launch-gated facts while the menu truly stands', () => {
	const environment = createEnvironment();
	const menu = { isConnected: true };
	openChooser(environment, menu);
	environment.advance(15000);
	fireWatchdog(environment, 1);
	let snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[RENDERER].status, 'complete');
	assert.equal(snapshot.milestones[RENDERER].importerStage, 'main-menu-webgl-frame-proof');
	fireWatchdog(environment);
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[TERRAIN].importerStage, 'main-menu-awaiting-selection');
	assert.equal(snapshot.milestones[TERRAIN].menuProofCount, 1);
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(environment.document.getElementById(FAILURE_ID), null);
	environment.advance(15000);
	fireWatchdog(environment);
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[CHOSSID].status, 'pending');
	assert.equal(snapshot.milestones[CHOSSID].menuProofCount, 1);
	assert.equal(snapshot.stalledMilestone, null);
	while (environment.activeTimer() && environment.performance.now() < 200000) {
		environment.advance(15000);
		fireWatchdog(environment);
	}
	snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.ok(environment.performance.now() >= 90000);
	assert.equal(snapshot.stalledMilestone, null);
	assert.equal(snapshot.milestones[TERRAIN].status, 'pending');
	assert.equal(snapshot.milestones[CHOSSID].status, 'pending');
	assert.ok(snapshot.milestones[TERRAIN].menuProofCount >= 2);
	assert.equal(environment.document.getElementById(FAILURE_ID), null);
	assert.equal(environment.activeTimer(), null);
});

test('a vanished chooser leaves the honest terrain silence verdict standing', () => {
	const environment = createEnvironment();
	const menu = { isConnected: true };
	openChooser(environment, menu);
	environment.advance(15000);
	fireWatchdog(environment, 1);
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment).milestones[RENDERER].status, 'complete');
	menu.isConnected = false;
	fireWatchdog(environment);
	const snapshot = getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.milestones[TERRAIN].status, 'timed-out');
	assert.equal(snapshot.stalledMilestone.name, TERRAIN);
	assert.equal(snapshot.stalledMilestone.failureCode, 'ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT');
	const panel = environment.document.getElementById(FAILURE_ID);
	assert.ok(panel);
	assert.match(panel.textContent, /ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT/);
});
