// B"H
// Boruch Hashem
// Blessed is He

import { FeatureStyleLoader } from './FeatureStyleLoader.js';

/**
 * Stages optional editor worlds after the first rendered frame instead of before it.
 * The Awtsmoos renews the visible stage first; Awtsmoos.com then unfolds interaction,
 * NLE, Studio, AI, and compatibility layers with explicit phases and recoverable errors.
 */
export class AnimatorStartupHydrator {
	/**
	 * Schedules post-paint hydration without delaying the caller or render heartbeat.
	 * @param {object} app Running Animator application.
	 * @returns {void}
	 */
	static start(app) {
		this.status().startedAt = performance.now();
		this.mark('core-ready');
		this.afterFrames(2, () => void this.hydrate(app));
	}

	/** @param {object} app @returns {Promise<void>} Hydrates primary then secondary tools. */
	static async hydrate(app) {
		try {
			this.mark('interaction-loading');
			await this.hydrateInteractions(app);
			this.mark('interaction-ready');
			await this.idle();
			this.mark('professional-loading');
			await FeatureStyleLoader.load();
			const [{ NLESystem }, { AnimatorExtensionInstaller }] = await Promise.all([
				import('../../nle/NLESystem.js'),
				import('./AnimatorExtensionInstaller.js')
			]);
			app.nle = NLESystem.install(app);
			await AnimatorExtensionInstaller.installPrimary(app);
			this.mark('professional-ready');
			await this.idle();
			await Promise.all([
				AnimatorExtensionInstaller.installSecondary(app),
				this.hydrateLegacyBindings(app)
			]);
			this.mark('complete');
		} catch (error) {
			this.fail('startup-hydration', error);
		}
	}

	/** @param {object} app @returns {Promise<void>} Loads non-render-critical interaction systems. */
	static async hydrateInteractions(app) {
		const [camera, debug, diegetic, selection, toast, tooltip, ruach] = await Promise.all([
			import('./CameraControls.js'),
			import('../../debug/DebugSystem.js'),
			import('../../engine/reality/interaction/DiegeticEditor.js'),
			import('../../interaction/SelectionBridge.js'),
			import('../ui/toast/ToastManager.js'),
			import('../../ui/components/tooltip/TooltipManager.js'),
			import('../../engine/reality/breath/RuachInterface.js')
		]);
		debug.DebugSystem.install(app);
		camera.CameraControls.setup(app);
		diegetic.DiegeticEditor.bind(app.ctx.canvas, app.state);
		selection.SelectionBridge.bind(app);
		toast.ToastManager.init();
		tooltip.TooltipManager.init();
		this.bindRuach(app, ruach.RuachInterface);
	}

	/** @param {object} app @returns {Promise<void>} Restores compatibility UI after Studio exists. */
	static async hydrateLegacyBindings(app) {
		const { AppUI } = await import('./AppUI.js');
		await AppUI.hydrateDeferredBindings(app);
	}

	/** @param {object} app @param {Function} RuachInterface @returns {void} */
	static bindRuach(app, RuachInterface) {
		const awaken = () => RuachInterface.awaken(app.state);
		app.ctx.canvas.addEventListener('pointerdown', awaken, { once: true, passive: true });
	}

	/** @param {number} count @param {Function} callback @returns {void} */
	static afterFrames(count, callback) {
		if (count <= 0) return callback();
		requestAnimationFrame(() => this.afterFrames(count - 1, callback));
	}

	/** @returns {Promise<void>} Yields until idle time or a short fallback turn. */
	static idle() {
		return new Promise((resolve) => {
			if ('requestIdleCallback' in window) {
				window.requestIdleCallback(() => resolve(), { timeout: 600 });
				return;
			}
			setTimeout(resolve, 32);
		});
	}

	/** @returns {Object} Global boot ledger used by humans, tests, and diagnostics. */
	static status() {
		window.__AWTSMOOS_BOOT_STATUS__ ||= { phase: 'starting', timeline: [], errors: [] };
		return window.__AWTSMOOS_BOOT_STATUS__;
	}

	/** @param {string} phase @returns {void} */
	static mark(phase) {
		const status = this.status();
		status.phase = phase;
		status.timeline.push({ phase, at: performance.now() });
	}

	/** @param {string} scope @param {Error} error @returns {void} */
	static fail(scope, error) {
		const status = this.status();
		status.phase = 'degraded';
		status.errors.push({ scope, message: error?.message || String(error) });
		console.error(`B"H - ${scope} failed after first paint.`, error);
	}
}
