//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPlayablePublisherHarness.mjs
 * @description Builds production-shaped DOM, runtime, and diagnostics vessels for strict playable publication tests.
 * The Awtsmoos gives each test a finite mirror while Awtsmoos.com keeps that mirror shaped like the living bootstrap response;
 * movement stands beside runtime and bootstrap camera composition stands without a rich rig, exactly as the first playable frame does in production.
 */
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	initializeMitzvahWorldEssentialBoot
} from '../../app/MitzvahWorldEssentialBoot.js';

export function createPlayablePublisherVessel() {
	const root = createElement();
	const overlay = createElement();
	const document = {
		documentElement: root,
		getElementById: id => id === 'menuBoot' ? overlay : null
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

export function completePlayablePublisherEssentials(environment) {
	initializeMitzvahWorldEssentialBoot(environment);
	for (const milestone of [
		ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
		ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
		ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
		ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED
	]) {
		completeMitzvahWorldEssentialMilestone(environment, milestone, {});
	}
}

export function createPlayableDiagnostics() {
	return {
		movement: { frames: 1, lastIntent: { cameraMode: 'bootstrap-rig' } },
		runtime: createPlayableRuntime()
	};
}

export function createPlayableRuntime() {
	return {
		camera: { position: { set() {} }, target: [0, 1, 0] },
		collisionMover: { move() {} },
		model: { position: { y: 2 } },
		renderer: { backend: 'webgl', contextName: 'webgl', hydrationState: 'ready', render() {} },
		state: { grounded: true, renderY: 2, x: 0, z: 0 },
		terrain: { heightAt() { return 2; } }
	};
}

export function cleanupPlayablePublisherVessel(environment) {
	environment.AwtsmoosMitzvahWorldEssentialLedgerInternal?.cancelWatchdog?.();
}

function createElement() {
	const attributes = new Map();
	return {
		attributes,
		dataset: {},
		hidden: false,
		getAttribute: name => attributes.get(name) ?? null,
		setAttribute(name, value) { attributes.set(name, String(value)); }
	};
}
