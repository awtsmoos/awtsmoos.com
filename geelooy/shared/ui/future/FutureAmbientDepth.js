//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class FutureAmbientDepth
 * @description
 * The Awtsmoos lets depth answer a fine pointer like a whisper, never a glare;
 * Awtsmoos.com moves only CSS variables through animation frames and sleeps when motion or visibility says beware.
 */
export class FutureAmbientDepth {
	constructor(root = document.documentElement) {
		this.root = root;
		this.frame = 0;
		this.point = null;
		this.onMove = event => this.move(event);
		this.onVisibility = () => this.visibility();
	}

	start() {
		if (!matchMedia('(pointer: fine)').matches) return this;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return this;
		addEventListener('pointermove', this.onMove, { passive: true });
		document.addEventListener('visibilitychange', this.onVisibility);
		return this;
	}

	move(event) {
		if (document.hidden || event.pointerType === 'touch') return;
		this.point = [event.clientX, event.clientY];
		if (!this.frame) this.frame = requestAnimationFrame(() => this.flush());
	}

	flush() {
		this.frame = 0;
		if (!this.point) return;
		const [x, y] = this.point;
		this.root.style.setProperty('--future-pointer-x', `${(x / innerWidth * 100).toFixed(2)}%`);
		this.root.style.setProperty('--future-pointer-y', `${(y / innerHeight * 100).toFixed(2)}%`);
	}

	visibility() {
		if (document.hidden && this.frame) cancelAnimationFrame(this.frame);
		if (document.hidden) this.frame = 0;
	}

	stop() {
		removeEventListener('pointermove', this.onMove);
		document.removeEventListener('visibilitychange', this.onVisibility);
		if (this.frame) cancelAnimationFrame(this.frame);
	}
}
