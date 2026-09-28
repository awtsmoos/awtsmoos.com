//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPlayablePublisherHarness.mjs
 * @description Builds the smallest truthful DOM and runtime vessels needed by strict playable publication tests.
 * The Awtsmoos gives each test a finite mirror while Awtsmoos.com keeps the mirror faithful to the living gate;
 * terrain, traveler, camera, collision, loader, and essential ledger stand together so false success cannot imitate.
 */
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	initializeMitzvahWorldEssentialBoot
} from '../../app/MitzvahWorldEssentialBoot.js';

/** Creates the page-owned loader, DOM witnesses, and isolated essential-ledger environment. */
export function createPlayablePublisherVessel() {
	const root = createElement();
	const overlay = createElement();
	const document = {
		documentElement: root,
		getElementById(id) {
			return id === 'menuBoot' ? overlay : null;
		}
	};
	const environment = {
		clearTimeout: globalThis.clearTimeout,
		document,
		performance: globalThis.performance,
		setTimeout: globalThis.setTimeout
	};
	let finishes = 0;
	const loading = {
		finish() {
			finishes += 1;
			overlay.dataset.loadingComplete = 'true';
			overlay.hidden = true;
			overlay.setAttribute('aria-hidden', 'true');
			overlay.setAttribute('aria-busy', 'false');
		}
	};
	return {
		environment,
		finishCount: () => finishes,
		options: { documentValue: document, environment, loading },
		overlay,
		root
	};
}

/** Completes every essential milestone in dependency order. */
export function completePlayablePublisherEssentials(environment) {
	initializeMitzvahWorldEssentialBoot(environment);
	const order = [
		ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
		ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
		ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
		ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED
	];
	for (const milestone of order) {
		completeMitzvahWorldEssentialMilestone(environment, milestone, {});
	}
}

/** Returns a runtime satisfying the same physical inspector used by production. */
export function createPlayableRuntime() {
	return {
		camera: {},
		cameraRig: { update() {} },
		collisionMover: { move() {} },
		model: { position: { y: 2 } },
		movement: { frames: 1, lastIntent: { cameraMode: 'follow' } },
		renderer: {
			backend: 'webgl',
			contextName: 'webgl',
			hydrationState: 'ready',
			render() {}
		},
		state: { grounded: true, renderY: 2, x: 0, z: 0 },
		terrain: { heightAt() { return 2; } }
	};
}

/** Cancels the isolated essential-ledger watchdog so the test process can end naturally. */
export function cleanupPlayablePublisherVessel(environment) {
	environment.AwtsmoosMitzvahWorldEssentialLedgerInternal?.cancelWatchdog?.();
}

function createElement() {
	const attributes = new Map();
	return {
		attributes,
		dataset: {},
		hidden: false,
		getAttribute(name) {
			return attributes.get(name) ?? null;
		},
		setAttribute(name, value) {
			attributes.set(name, String(value));
		}
	};
}
