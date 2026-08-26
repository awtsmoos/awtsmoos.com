// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description
 * The Awtsmoos renews the Animator from first viewport breath to every rendered frame;
 * Awtsmoos.com keeps the entrance small while modular guardians awaken canvas, timeline, agents, and the studio by name.
 */

import { AppCore } from './core/app/AppCore.js';
import { AppUI } from './core/app/AppUI.js';
import { AnimatorExtensionInstaller } from './core/app/AnimatorExtensionInstaller.js';
import { CameraControls } from './core/app/CameraControls.js';
import { DefaultSceneInstaller } from './core/app/DefaultSceneInstaller.js';
import { AutoPlayCovenant } from './core/playback/AutoPlayCovenant.js';
import { RenderLoop } from './core/renderer/pipeline/RenderLoop.js';
import { ToastManager } from './core/ui/toast/ToastManager.js';
import { DebugSystem } from './debug/DebugSystem.js';
import { RuachInterface } from './engine/reality/breath/RuachInterface.js';
import { DiegeticEditor } from './engine/reality/interaction/DiegeticEditor.js';
import { SelectionBridge } from './interaction/SelectionBridge.js';
import { NLESystem } from './nle/NLESystem.js';
import { CanvasSizeGuardian } from './rectification/CanvasSizeGuardian.js';
import { MobileViewportGuardian } from './rectification/MobileViewportGuardian.js';
import { TooltipManager } from './ui/components/tooltip/TooltipManager.js';

/**
 * Awakens the canonical Animator runtime before optional professional extensions are installed.
 * @returns {Promise<void>} Resolves after core initialization and extension scheduling.
 */
async function boot() {
	MobileViewportGuardian.bind();
	const yesodLegacy = new URLSearchParams(location.search).get('legacy') === '1';
	prepareStorage(yesodLegacy);
	const olamApp = new AppCore();
	window.__AWTSMOOS_PARK_APP__ = olamApp;
	window.__AWTSMOOS_EXTENSION_STATUS__ = {};
	AppUI.setup(olamApp);
	olamApp.initContext('character-canvas');
	if (!olamApp.ctx?.canvas || !olamApp.ctx?.ctx) {
		throw new Error('B"H - Canvas context failed.');
	}
	installCore(olamApp, yesodLegacy);
	RenderLoop.start(olamApp);
	queueMicrotask(() => AnimatorExtensionInstaller.installAll(olamApp));
}

/**
 * Prepares the default cinematic scene unless explicit legacy mode requests historic storage behavior.
 * @param {boolean} yesodLegacy Whether the legacy query mode is active.
 */
function prepareStorage(yesodLegacy) {
	if (yesodLegacy) return;
	localStorage.removeItem('aw_preserve_scene');
	localStorage.setItem('aw_real_character_scene', 'reference-trio-sitcom-v2');
}

/**
 * Installs the shared editor, camera, selection, NLE, and playback systems in their historic order.
 * @param {object} olamApp Running Animator application.
 * @param {boolean} yesodLegacy Whether default-scene replacement must be suppressed.
 */
function installCore(olamApp, yesodLegacy) {
	CanvasSizeGuardian.bind(olamApp.ctx.canvas, olamApp.ctx);
	DebugSystem.install(olamApp);
	CameraControls.setup(olamApp);
	DiegeticEditor.bind(olamApp.ctx.canvas, olamApp.state);
	SelectionBridge.bind(olamApp);
	ToastManager.init();
	TooltipManager.init();
	const sederSequence = DefaultSceneInstaller.install(olamApp, {
		force: !yesodLegacy,
		legacy: yesodLegacy
	});
	olamApp.director.play(sederSequence, 0);
	AutoPlayCovenant.resume(olamApp);
	olamApp.nle = NLESystem.install(olamApp);
	bindRuach(olamApp);
}

/**
 * Defers audio-interface awakening until the first trusted pointer gesture and then removes itself.
 * @param {object} olamApp Running Animator application.
 */
function bindRuach(olamApp) {
	const awakenRuach = () => {
		RuachInterface.awaken(olamApp.state);
		olamApp.ctx.canvas.removeEventListener('pointerdown', awakenRuach);
	};
	olamApp.ctx.canvas.addEventListener('pointerdown', awakenRuach, {
		once: true,
		passive: true
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}
