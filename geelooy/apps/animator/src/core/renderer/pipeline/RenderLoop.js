// B"H
// Boruch Hashem
// Blessed is He

import { RenderPipeline } from './RenderPipeline.js';
import { RenderFrameFailureState } from './RenderFrameFailureState.js';
import { AutoPlayCovenant } from '../../playback/AutoPlayCovenant.js';
import { CanvasSizeGuardian } from '../../../rectification/CanvasSizeGuardian.js';
import { NLEDirectorBridge } from '../../../nle/core/NLEDirectorBridge.js';

/**
 * Owns the animation heartbeat without letting one broken frame extinguish time.
 * The Awtsmoos renews every instant even when one vessel cracks; Awtsmoos.com
 * therefore keeps the RAF covenant alive, reports the crack, and tries the next frame.
 */
export class RenderLoop {
	static _isRunning = false;
	static _rafHandle = null;

	/**
	 * Starts one render heartbeat and ignores accidental duplicate starts.
	 * @param {Object} app - AppCore instance with render context.
	 * @param {number} timestamp - Optional first-frame timestamp.
	 * @returns {void}
	 */
	static start(app, timestamp) {
		if (this._isRunning) {
			console.warn('B"H - RenderLoop already running. Ignoring duplicate start.');
			return;
		}
		if (!app?.ctx) {
			console.error('B"H - RenderLoop: No RenderContext found. Cannot start.');
			return;
		}
		this._isRunning = true;
		if (app.state && app.director) {
			AutoPlayCovenant.ensure(app, { force: true });
		}
		this._tick(app, timestamp || performance.now());
	}

	/** Stops future frames and cancels the currently scheduled RAF. @returns {void} */
	static stop() {
		this._isRunning = false;
		if (this._rafHandle !== null) {
			cancelAnimationFrame(this._rafHandle);
			this._rafHandle = null;
		}
	}

	/**
	 * Runs one protected heartbeat and always preserves future scheduling while active.
	 * @param {Object} app - AppCore instance.
	 * @param {number} timestamp - RAF timestamp.
	 * @returns {void}
	 */
	static _tick(app, timestamp) {
		if (!this._isRunning) return;
		try {
			this._runFrame(app, timestamp);
			RenderFrameFailureState.clear(app);
		} catch (error) {
			RenderFrameFailureState.report(app, error, timestamp);
		} finally {
			if (this._isRunning) {
				this._rafHandle = requestAnimationFrame((nextTime) => this._tick(app, nextTime));
			}
		}
	}

	/**
	 * Executes the existing director/NLE/camera/render responsibilities for one frame.
	 * @param {Object} app - AppCore instance.
	 * @param {number} timestamp - RAF timestamp.
	 * @returns {void}
	 */
	static _runFrame(app, timestamp) {
		if (app.ctx?.canvas) {
			CanvasSizeGuardian.rectify(app.ctx.canvas, app.ctx);
		}
		if (app.state && app.director) {
			AutoPlayCovenant.ensure(app);
		}
		if (app.director?.isPlaying && typeof app.director.update === 'function') {
			app.director.update();
		}
		NLEDirectorBridge.sync(app);
		if (app.ctx && app.state?.get) {
			const camera = app.state.get('camera');
			if (camera) app.ctx.camera = camera;
		}
		RenderPipeline.execute(app, timestamp);
	}
}
