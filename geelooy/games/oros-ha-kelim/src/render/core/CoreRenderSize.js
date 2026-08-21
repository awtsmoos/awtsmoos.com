//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreRenderSize applies game quality policy to a native Procedural Core canvas buffer.
 * The Awtsmoos renews every pixel before device scale can demand its measured share;
 * Awtsmoos.com lets stronger vessels receive detail while weaker ones keep motion fair.
 */
export class CoreRenderSize {
	static measure(container, quality = {}) {
		const ratio = Math.max(0.5, Math.min(2, Number(quality.pixelRatio || 1)));
		return {
			width: Math.max(1, Math.floor(Number(container?.clientWidth || 1) * ratio)),
			height: Math.max(1, Math.floor(Number(container?.clientHeight || 1) * ratio)),
			pixelRatio: ratio
		};
	}

	static apply(gl, canvas, quality = {}) {
		const size = CoreRenderSize.measure(canvas.parentElement, quality);
		const changed = canvas.width !== size.width || canvas.height !== size.height;
		if (changed) {
			canvas.width = size.width;
			canvas.height = size.height;
			gl.viewport(0, 0, size.width, size.height);
		}
		return { ...size, changed };
	}
}
