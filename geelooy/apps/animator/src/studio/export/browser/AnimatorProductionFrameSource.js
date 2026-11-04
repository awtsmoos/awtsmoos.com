// B"H
// Boruch Hashem
// Blessed is He

/**
 * Finite movie time becomes a visible frame only through the production canvas.
 * The Awtsmoos renews that one vessel while Awtsmoos.com transfers its finished
 * pixels without granting the encoding worker any knowledge of character anatomy.
 *
 * A frame wait is bounded: a hidden, headless, or throttled tab may starve
 * requestAnimationFrame for seconds — or forever — and an export must not
 * inherit that stall. When vsync does not answer promptly, one frame is drawn
 * synchronously through the render loop's own protected path, so the pixels
 * captured are still the app's truthful frame for the seeked time.
 */

import { RenderLoop } from '../../../core/renderer/pipeline/RenderLoop.js';

/** Longest one export frame may wait for a vsync tick before drawing on demand. */
const FRAME_WAIT_TIMEOUT_MS = 250;

export class AnimatorProductionFrameSource {
	constructor(targetWindow = globalThis.window) {
		this.window = targetWindow;
		this.document = targetWindow?.document;
		this.app = targetWindow?.__AWTSMOOS_PARK_APP__;
		this.canvas = this.document?.querySelector('#character-canvas');
		if (!this.app?.director || !this.canvas) {
			throw new Error('The authoritative Animator production canvas is unavailable.');
		}
	}

	async prepare(width, height) {
		this.canvas.style.setProperty('position', 'fixed', 'important');
		this.canvas.style.setProperty('inset', 'auto', 'important');
		this.canvas.style.setProperty('left', '0', 'important');
		this.canvas.style.setProperty('top', '0', 'important');
		this.canvas.style.setProperty('width', `${width}px`, 'important');
		this.canvas.style.setProperty('height', `${height}px`, 'important');
		this.app.state.set('userPausedPlayback', true, true);
		this.app.state.set('isPlaying', false, true);
		this.app.director.stop();
		this.window.dispatchEvent(new this.window.Event('resize'));
		await this.waitForSize(width, height);
	}

	async capture(timeMs, width, height) {
		this.app.director.stop();
		this.app.director.seek(timeMs);
		// The app's own scrub law (PlaybackEngine.seek): an explicit forced
		// update poses every character at the exact seek moment even while
		// paused; the render loop alone only updates a playing director, so
		// without this the canvas could hold the previous moment's pose.
		this.app.director.update?.(true);
		await this.animationFrame();
		await this.animationFrame();
		return this.window.createImageBitmap(
			this.canvas,
			0,
			0,
			this.canvas.width,
			this.canvas.height,
			{ resizeWidth: width, resizeHeight: height, resizeQuality: 'high' }
		);
	}

	async waitForSize(width, height) {
		for (let attempt = 0; attempt < 180; attempt += 1) {
			if (
				this.canvas.width === width
				&& this.canvas.height === height
				&& this.canvas.clientWidth === width
				&& this.canvas.clientHeight === height
			) {
				await this.animationFrame();
				return;
			}
			await new Promise(resolve => this.window.setTimeout(resolve, 40));
		}
		throw new Error(`Production canvas did not settle at ${width}x${height}.`);
	}

	/**
	 * Waits for the next vsync tick, but never longer than
	 * FRAME_WAIT_TIMEOUT_MS: on timeout one frame is drawn synchronously
	 * through RenderLoop.runOneFrame (the heartbeat's own protected path)
	 * and the wait resolves, so throttled tabs cannot stall the export.
	 */
	animationFrame() {
		return new Promise(resolve => {
			let settled = false;
			const finish = () => {
				if (settled) return;
				settled = true;
				resolve();
			};
			const timer = this.window.setTimeout(() => {
				this.forceFrame();
				finish();
			}, FRAME_WAIT_TIMEOUT_MS);
			this.window.requestAnimationFrame(() => {
				this.window.clearTimeout(timer);
				finish();
			});
		});
	}

	/** Draws one truthful frame on demand; the loop's next tick remains a fallback. */
	forceFrame() {
		try {
			RenderLoop.runOneFrame(this.app, this.window.performance?.now?.() ?? Date.now());
		} catch { /* a failed forced frame must not kill the export */ }
	}
}
