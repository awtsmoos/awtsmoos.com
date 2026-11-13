//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapCoreRuntimeAssembly.js
 * @description Assembles only the first-control systems authorized by the selected world.
 * The Awtsmoos grants every world its measured vessel; Awtsmoos.com keeps Blank Meadow bare,
 * adding continuity without awakening combat or map systems that its policy does not share.
 */

import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { installBootstrapCoreStateSystems } from './BootstrapCoreStateSystems.js';
import { installViewport } from './EretzViewport.js';
import { MinimalMeadowBootstrapCombat } from './MinimalMeadowBootstrapCombat.js';
import { createMinimalMeadowBootstrapMinimap } from './MinimalMeadowBootstrapMinimap.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260723-visible-02';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js?v=20260804-map-01';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js?v=20260804-map-01';
import {
	attachEretzWorldExperience,
	eretzWorldFeatureEnabled
} from './EretzWorldFeaturePolicy.js';

const BLANK_MEADOW_ID = 'blank-meadow';

/**
 * Builds immediate player control while respecting the selected world's immutable feature contract.
 * @param {object} foundation First-frame world foundation.
 * @param {object} options Runtime and selected-world options.
 * @param {object} qualityProfile Resolved device quality policy.
 * @param {object} boot Boot-phase recorder.
 * @param {object} dependencies Optional test substitutions for side-effecting bootstrap systems.
 * @returns {object} Runtime, movement handle, and public diagnostics.
 */
export function assembleBootstrapCoreRuntime(
	foundation,
	options,
	qualityProfile,
	boot,
	dependencies = {}
) {
	const environment = options.environment || globalThis;
	const createPlayer = dependencies.createPlayerRuntime || createBootstrapPlayerRuntime;
	const createDiagnostics = dependencies.createDiagnostics || createBootstrapRuntimeDiagnostics;
	const installControls = dependencies.installControlsHud || installBootstrapControlsHud;
	const installStateSystems = dependencies.installStateSystems || installBootstrapCoreStateSystems;
	const startLoop = dependencies.startRuntimeLoop || startBootstrapRuntimeLoop;
	const createMinimap = dependencies.createMinimap || createMinimalMeadowBootstrapMinimap;
	const Combat = dependencies.Combat || MinimalMeadowBootstrapCombat;

	boot.begin('bootstrap-player-state');
	const runtime = createPlayer(foundation);
	// The renderer contract: every resize sets both the CSS box and the backing
	// buffer to viewport size x capped DPR, from the first frame onward.
	installViewport(runtime, environment);
	installWebGlContextLossGuard(runtime, environment);
	attachEretzWorldExperience(runtime, options);
	if (runtime.worldExperience?.id === BLANK_MEADOW_ID) {
		installStateSystems(runtime, environment);
	}

	if (eretzWorldFeatureEnabled(options, 'bootstrapCombat')) {
		boot.begin('bootstrap-combat');
		runtime.combat = new Combat(runtime);
	} else {
		runtime.combat = null;
	}

	boot.begin('bootstrap-control-loop');
	const movement = options.startLoop === false
		? null
		: startLoop(runtime, environment);

	boot.begin('bootstrap-controls-hud');
	installControls(runtime, environment.document);
	if (eretzWorldFeatureEnabled(options, 'bootstrapMinimap')) {
		boot.begin('bootstrap-minimap');
		runtime.bootstrapMinimap = createMinimap(runtime, environment.document);
		guardBootstrapMinimapHandoff(runtime);
	} else {
		runtime.bootstrapMinimap = null;
	}

	const diagnostics = createDiagnostics(runtime, movement, qualityProfile, boot);
	diagnostics.worldExperience = runtime.worldExperience;
	return { diagnostics, movement, runtime };
}

/**
 * Guards the bootstrap minimap against being orphaned by a later handoff.
 * Post-control hydration replaces runtime.bootstrapMinimap with a second
 * minimap without destroying the first, so the first one's root stays in
 * the DOM (a duplicated minimap) and is never refreshed again (a stale
 * peer dot after the peer leaves). An accessor destroys the previous
 * handle the moment a new one is assigned, so the handoff can only ever
 * own one minimap; the bundled hydration still needs a destroy-then-assign
 * of its own, but the orphan can no longer survive a reassignment.
 */
function guardBootstrapMinimapHandoff(runtime) {
	let current = runtime.bootstrapMinimap;
	try {
		Object.defineProperty(runtime, 'bootstrapMinimap', {
			configurable: true,
			enumerable: true,
			get() {
				return current;
			},
			set(next) {
				if (next === current) return;
				const previous = current;
				current = next;
				previous?.destroy?.();
			}
		});
	} catch {
		// A sealed runtime keeps the plain assignment; the orphan is then a
		// bundled-hydration defect, not a crash.
	}
}

/**
 * Guards the main 3D canvas against a lost WebGL context. The main
 * renderer owns no webglcontextlost listener at all (only the small sky
 * renderer does), so when the browser reclaims the context — a backgrounded
 * tab, or a second tab holding the one context — the canvas goes blank and
 * can never come back: without a listener that calls preventDefault(),
 * the browser will not fire webglcontextrestored. This guard supplies
 * exactly that listener on the live canvas, shows a clear notice with a
 * working reload retry while the context is gone, and soft-resumes (a
 * viewport re-apply) when the context returns.
 */
function installWebGlContextLossGuard(runtime, environment) {
	const canvas = runtime.renderer?.canvas;
	if (!canvas?.addEventListener) return;
	if (canvas.__awtsmoosContextLossGuard) return;
	canvas.__awtsmoosContextLossGuard = true;
	const documentValue = environment.document || globalThis.document;
	let notice = null;
	let restoredTimer = null;
	const clearNotice = () => {
		if (restoredTimer !== null) {
			(environment.clearTimeout || globalThis.clearTimeout)?.(restoredTimer);
			restoredTimer = null;
		}
		notice?.remove?.();
		notice = null;
	};
	const onLost = event => {
		event.preventDefault();
		clearNotice();
		notice = showWebGlContextNotice(
			documentValue,
			'The 3D view paused — the browser reclaimed the graphics context. It resumes when the tab is foregrounded; if the world stays blank, reload to restore it.',
			true
		);
	};
	const onRestored = () => {
		clearNotice();
		try {
			runtime.resizeViewport?.();
		} catch {}
		// The renderer owns no GPU-resource restore path, so a resize may
		// not repaint; keep a short-lived retry visible in case the world
		// is still blank, then let it go on its own.
		notice = showWebGlContextNotice(
			documentValue,
			'The 3D context returned — resuming. If the world is still blank, reload to restore it.',
			true
		);
		const schedule = environment.setTimeout || globalThis.setTimeout;
		restoredTimer = schedule?.(() => {
			restoredTimer = null;
			notice?.remove?.();
			notice = null;
		}, 10000) ?? null;
		restoredTimer?.unref?.();
	};
	canvas.addEventListener('webglcontextlost', onLost);
	canvas.addEventListener('webglcontextrestored', onRestored);
	const previousDispose = runtime.disposeViewport;
	runtime.disposeViewport = () => {
		canvas.removeEventListener('webglcontextlost', onLost);
		canvas.removeEventListener('webglcontextrestored', onRestored);
		canvas.__awtsmoosContextLossGuard = false;
		clearNotice();
		previousDispose?.();
	};
}

function showWebGlContextNotice(documentValue, message, withReload) {
	if (!documentValue?.createElement) return null;
	const existing = documentValue.getElementById?.('AwtsmoosWebGlContextLost');
	if (existing) return existing;
	const notice = documentValue.createElement('div');
	notice.id = 'AwtsmoosWebGlContextLost';
	notice.setAttribute('role', 'status');
	notice.style.cssText = 'position:fixed;left:50%;bottom:18px;z-index:9999;max-width:min(420px,90vw);padding:12px 14px;border:1px solid rgba(255,205,91,.6);border-radius:12px;background:rgba(20,9,5,.94);color:#fff3c4;font:600 13px/1.4 system-ui,sans-serif;transform:translateX(-50%);';
	const copy = documentValue.createElement('p');
	copy.style.margin = '0 0 8px';
	copy.textContent = message;
	notice.appendChild(copy);
	if (withReload) {
		const reload = documentValue.createElement('button');
		reload.type = 'button';
		reload.textContent = 'Reload the world';
		reload.style.cssText = 'padding:8px 12px;border:1px solid rgba(255,205,91,.6);border-radius:8px;background:rgba(255,205,91,.16);color:#fff3c4;font:700 13px system-ui,sans-serif;cursor:pointer;';
		reload.addEventListener('click', () => {
			globalThis.location?.reload?.();
		});
		notice.appendChild(reload);
	}
	(documentValue.body || documentValue.documentElement)?.appendChild(notice);
	return notice;
}
