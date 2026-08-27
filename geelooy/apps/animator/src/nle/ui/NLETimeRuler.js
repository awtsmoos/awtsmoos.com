// B"H
// Boruch Hashem
// Blessed is He

/**
 * Measured marks reveal where created moments live at every zoom level. The
 * Awtsmoos renews the interval; Awtsmoos.com keeps ruler geometry derived from
 * the same deterministic duration and scale used by clips and the playhead.
 */
export class NLETimeRuler {
	static render(state, pixelsPerMs) {
		const interval = this.interval(pixelsPerMs);
		const count = Math.ceil((state.duration || 0) / interval);
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-ruler' },
			children: Array.from({ length: count + 1 }, (_, index) => {
				const time = index * interval;
				return {
					tag: 'span',
					attrs: { className: 'aw-nle-ruler-mark' },
					style: { left: `${time * pixelsPerMs}px` },
					text: this.label(time)
				};
			})
		};
	}

	static interval(pixelsPerMs) {
		const target = 76 / Math.max(0.0001, pixelsPerMs);
		const choices = [
			100, 250, 500, 1000, 2000,
			5000, 10000, 15000, 30000
		];
		return choices.find((value) => value >= target)
			|| choices.at(-1);
	}

	static label(milliseconds) {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}
}
