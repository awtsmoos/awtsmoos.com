//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MainMenuWebGlPrewarm.js
 * @description Opens the canonical canvas's genuine WebGL context after the chooser paints, overlapping GPU startup with population/network work before world selection.
 * The Awtsmoos awakens the same vessel before the traveler names the meadow; Awtsmoos.com pays no second creation toll,
 * while the later renderer still receives the identical real context and remains the sole judge of essential WebGL truth.
 * The warmup also arms the essential gate with a first-frame prover on this same canvas, so when the
 * first-frame deadline arrives the gate can drive one genuine frame on demand instead of condemning
 * a healthy renderer merely because no world launch has painted yet. And while a menu vessel is
 * given, it arms the gate's chooser witness too: the facts only a launch can produce are then judged
 * as awaiting the player's selection for exactly as long as the chooser truly stands in the page.
 */

import {
	registerMitzvahWorldEssentialFrameProver,
	registerMitzvahWorldEssentialMenuWitness
} from '../app/MitzvahWorldEssentialBoot.js';
import { proveMainMenuWebGlFirstFrame } from './MainMenuWebGlFirstFrameProof.js';

export const MAIN_MENU_WEBGL_CONTEXT_OPTIONS = Object.freeze({
	alpha: true,
	antialias: false,
	premultipliedAlpha: true
});

const RECEIPT_KEY = 'AwtsmoosMitzvahWorldWebGlPrewarm';
const ACTIVE_STATES = new Set(['scheduled', 'warming', 'ready']);

/** Schedules one real WebGL context warmup after the menu has an opportunity to paint. */
export function scheduleMainMenuWebGlPrewarm(canvas, environment = globalThis, menuElement = null) {
	registerEssentialFrameProof(canvas, environment);
	registerEssentialMenuWitness(menuElement, environment);
	const existing = environment?.[RECEIPT_KEY];
	if (existing && ACTIVE_STATES.has(existing.status)) return existing;
	const receipt = {
		contextReady: false,
		durationMs: null,
		error: '',
		finishedAt: null,
		startedAt: null,
		status: 'scheduled'
	};
	if (environment && typeof environment === 'object') environment[RECEIPT_KEY] = receipt;
	if (!canvas || typeof canvas.getContext !== 'function') {
		receipt.status = 'unavailable';
		receipt.error = 'Canonical canvas cannot create a WebGL context.';
		return receipt;
	}
	scheduleAfterPaint(() => warmContext(canvas, environment, receipt), environment);
	return receipt;
}

/**
 * Arms the living essential ledger with a prover bound to this exact canvas.
 * Registration is a quiet peek: with no ledger there is no gate to arm, and a
 * registration failure must never disturb the chooser's own warmup covenant.
 */
function registerEssentialFrameProof(canvas, environment) {
	try {
		registerMitzvahWorldEssentialFrameProver(environment, () => {
			return proveMainMenuWebGlFirstFrame(canvas, environment);
		});
	} catch { /* the gate keeps its honest timeout when no prover can be armed */ }
}

/**
 * Arms the living essential ledger with a witness bound to this exact chooser vessel.
 * The witness testifies only while the vessel is connected to the page — the precise
 * span in which first play has genuinely not been requested — and falls silent the
 * moment the chooser is removed, whatever later surface inherits the ledger.
 */
function registerEssentialMenuWitness(menuElement, environment) {
	if (!menuElement) return;
	try {
		registerMitzvahWorldEssentialMenuWitness(environment, () => {
			return menuElement.isConnected === true
				? { importerStage: 'main-menu-awaiting-selection', resourceStatus: 'chooser-live-no-launch-requested' }
				: null;
		});
	} catch { /* the gate keeps its honest timeout when no witness can be armed */ }
}

function warmContext(canvas, environment, receipt) {
	if (receipt.status !== 'scheduled') return receipt;
	receipt.status = 'warming';
	receipt.startedAt = now(environment);
	try {
		const context = canvas.getContext('webgl', MAIN_MENU_WEBGL_CONTEXT_OPTIONS);
		receipt.contextReady = Boolean(context);
		receipt.status = context ? 'ready' : 'unavailable';
		if (!context) receipt.error = 'Browser did not provide the required WebGL context.';
	} catch (error) {
		receipt.status = 'failed';
		receipt.error = error?.message || String(error);
	}
	receipt.finishedAt = now(environment);
	receipt.durationMs = Math.max(0, receipt.finishedAt - receipt.startedAt);
	return receipt;
}

function scheduleAfterPaint(task, environment) {
	const scheduleTask = typeof environment?.setTimeout === 'function'
		? environment.setTimeout.bind(environment)
		: setTimeout;
	if (typeof environment?.requestAnimationFrame === 'function') {
		environment.requestAnimationFrame(() => scheduleTask(task, 0));
		return;
	}
	scheduleTask(task, 0);
}

function now(environment) {
	return typeof environment?.performance?.now === 'function'
		? environment.performance.now()
		: Date.now();
}
