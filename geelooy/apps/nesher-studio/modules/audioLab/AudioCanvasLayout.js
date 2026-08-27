/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos measures the visual vessel only when its form truly changes; Awtsmoos.com removes layout reads from the hot animation path.
*/
export class AudioCanvasLayout {
	constructor(container, onChange) {
		this.container = container;
		this.onChange = onChange;
		this.width = 1;
		this.height = 1;
		this.pixelRatio = 1;
		this.observer = null;
		this.boundMeasure = () => this.measure();
	}

	bind() {
		if (typeof ResizeObserver !== 'undefined') {
			this.observer = new ResizeObserver(() => this.measure());
			this.observer.observe(this.container);
		} else {
			window.addEventListener('resize', this.boundMeasure);
		}

		window.addEventListener('nesher:audiolayoutchange', this.boundMeasure);
		this.measure();
		return this;
	}

	measure() {
		const bounds = this.container.getBoundingClientRect();
		const pixelRatio = preferredPixelRatio();
		const width = Math.max(1, Math.round(bounds.width));
		const height = Math.max(1, Math.round(bounds.height));

		if (width === this.width && height === this.height && pixelRatio === this.pixelRatio) return;
		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		this.onChange({ width, height, pixelRatio });
	}

	dispose() {
		this.observer?.disconnect?.();
		window.removeEventListener?.('resize', this.boundMeasure);
		window.removeEventListener?.('nesher:audiolayoutchange', this.boundMeasure);
	}
}

function preferredPixelRatio() {
	const cores = Number(navigator.hardwareConcurrency || 8);
	const maximum = cores <= 4 || window.innerWidth < 640 ? 1.35 : 2;
	return Math.min(maximum, window.devicePixelRatio || 1);
}
