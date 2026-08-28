// B"H
// Boruch Hashem
// Blessed is He

import { AppCore } from './AppCore.js';
import { AnimatorStartupHydrator } from './AnimatorStartupHydrator.js';
import { AppUI } from './AppUI.js';
import { DefaultSceneInstaller } from './DefaultSceneInstaller.js';
import { AutoPlayCovenant } from '../playback/AutoPlayCovenant.js';
import { RenderLoop } from '../renderer/pipeline/RenderLoop.js';
import { CanvasSizeGuardian } from '../../rectification/CanvasSizeGuardian.js';
import { MobileViewportGuardian } from '../../rectification/MobileViewportGuardian.js';

/**
 * Awakens the real cinematic editor after the startup shell has already become visible.
 * The Awtsmoos renews the vessel and then its deeper light; Awtsmoos.com preserves the
 * canonical scene/render order while refusing to make that order responsible for blankness.
 */
export class AnimatorCoreBootstrap {
	/**
	 * Creates AppCore, replaces the startup shell, paints the default scene, and hydrates tools.
	 * @returns {Promise<object>} Fully started Animator application.
	 * @throws {Error} When the canonical stage canvas cannot provide its 2D context.
	 */
	static async boot() {
		this.mark('core-constructing');
		MobileViewportGuardian.bind();
		const yesodLegacy = new URLSearchParams(location.search).get('legacy') === '1';
		this.prepareStorage(yesodLegacy);
		const olamApp = new AppCore();
		window.__AWTSMOOS_PARK_APP__ = olamApp;
		window.__AWTSMOOS_EXTENSION_STATUS__ ||= {};
		AppUI.setup(olamApp);
		olamApp.initContext('character-canvas');
		if (!olamApp.ctx?.canvas || !olamApp.ctx?.ctx) {
			throw new Error('B"H - Canvas context failed.');
		}
		this.installFirstFrame(olamApp, yesodLegacy);
		RenderLoop.start(olamApp);
		this.mark('stage-running');
		AnimatorStartupHydrator.start(olamApp);
		void this.installViewportSeal();
		return olamApp;
	}

	/** @param {boolean} yesodLegacy Whether historic storage semantics were requested. */
	static prepareStorage(yesodLegacy) {
		if (yesodLegacy) return;
		localStorage.removeItem('aw_preserve_scene');
		localStorage.setItem('aw_real_character_scene', 'reference-trio-sitcom-v2');
	}

	/** @param {object} app @param {boolean} yesodLegacy @returns {void} */
	static installFirstFrame(app, yesodLegacy) {
		CanvasSizeGuardian.bind(app.ctx.canvas, app.ctx);
		const sederSequence = DefaultSceneInstaller.install(app, {
			force: !yesodLegacy,
			legacy: yesodLegacy
		});
		app.director.play(sederSequence, 0);
		AutoPlayCovenant.resume(app);
	}

	/** Loads the cooperative viewport seal after the first render heartbeat begins. */
	static async installViewportSeal() {
		try {
			await import('../../rectification/BootRectifier.js');
		} catch (error) {
			console.warn('B"H - Deferred viewport seal did not install.', error);
		}
	}

	/** @param {string} phase Durable startup phase. @returns {void} */
	static mark(phase) {
		const status = window.__AWTSMOOS_BOOT_STATUS__;
		if (!status) return;
		status.phase = phase;
		status.timeline.push({ phase, at: performance.now() });
	}
}
