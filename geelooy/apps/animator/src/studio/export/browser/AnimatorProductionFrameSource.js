// B"H
// Boruch Hashem
// Blessed is He

/**
 * Finite movie time becomes a visible frame only through the production canvas.
 * The Awtsmoos renews that one vessel while Awtsmoos.com transfers its finished
 * pixels without granting the encoding worker any knowledge of character anatomy.
 */
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

	animationFrame() {
		return new Promise(resolve => this.window.requestAnimationFrame(resolve));
	}
}
