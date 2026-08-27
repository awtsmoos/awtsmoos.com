// B"H
// Boruch Hashem
// Blessed is He

/**
 * Six fragments remain recognizable across every location through one shared
 * light language. The Awtsmoos renews each pulse while Awtsmoos.com preserves
 * orbit, flare, color identity, and directional radiance in one small vessel.
 */
export class BeaconFragmentPainter {
	static colors = ['#e7f5ff', '#55ddff', '#65f3ff', '#ff9c45', '#aa72ff', '#9cff65'];

	static orbit(canvas, x, y, phase, count = 6, radius = 74) {
		for (let index = 0; index < count; index += 1) {
			const angle = phase + index / count * Math.PI * 2;
			this.fragment(
				canvas,
				x + Math.cos(angle) * radius,
				y + Math.sin(angle) * radius * 0.55,
				this.colors[index % this.colors.length],
				phase + index
			);
		}
	}

	static fragment(canvas, x, y, color, phase) {
		const pulse = 8 + Math.sin(phase * 3) * 2;
		canvas.circle(x, y, pulse + 6, '#ffffff');
		canvas.circle(x, y, pulse, color);
		canvas.line(x - pulse * 1.8, y, x + pulse * 1.8, y, 1, color);
		canvas.line(x, y - pulse * 1.8, x, y + pulse * 1.8, 1, color);
	}
}
