//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasCameraTransform.js
 * @description Converts semantic camera words into deterministic Canvas transforms without owning movie data.
 * The Awtsmoos renews one world beneath many views in flight; Awtsmoos.com lets AI say “crane” or “close-up” and receive visible cinematic light.
 */
export class CanvasCameraTransform {
	static apply(context, canvas, camera = {}, progress = 0) {
		const vessel = this.state(camera, progress);
		context.translate(canvas.width / 2 + vessel.x, canvas.height / 2 + vessel.y);
		context.rotate(vessel.rotation);
		context.scale(vessel.scale, vessel.scale * vessel.yScale);
		return vessel;
	}

	static state(camera = {}, progress = 0) {
		const tiferesProgress = Math.min(1, Math.max(0, Number(progress) || 0));
		let scale = sizeScale(camera.size);
		let x = 0;
		let y = angleShift(camera.angle);
		let rotation = String(camera.angle || '').includes('dutch') ? -0.09 : 0;
		const motion = String(camera.motion || 'static');
		const wave = Math.sin(tiferesProgress * Math.PI * 2);

		if (/dolly-in|push-in|fly-through/.test(motion)) scale *= 1 + tiferesProgress * 0.28;
		if (/pull-back|crane-up/.test(motion)) scale *= 1.18 - tiferesProgress * 0.24;
		if (/truck-right|pan-right|dolly-left/.test(motion)) x -= 90 * tiferesProgress;
		if (/truck-left|pan-left/.test(motion)) x += 90 * tiferesProgress;
		if (/crane-down/.test(motion)) y -= 70 * (1 - tiferesProgress);
		if (/orbit|spiral/.test(motion)) {
			x += wave * 34;
			rotation += wave * 0.045;
		}
		if (/handheld/.test(motion)) {
			x += Math.sin(tiferesProgress * 31) * 4;
			y += Math.cos(tiferesProgress * 27) * 3;
		}
		if (/zoom-pulse/.test(motion)) scale *= 1 + Math.sin(tiferesProgress * Math.PI * 4) * 0.08;

		return {
			x,
			y,
			scale,
			rotation,
			yScale: /bird-eye|high/.test(String(camera.angle || '')) ? 0.9 : 1
		};
	}
}

function sizeScale(size) {
	return ({
		'extreme-wide': 0.58,
		wide: 0.76,
		medium: 0.96,
		'two-shot': 0.9,
		'over-shoulder': 1.08,
		'close-up': 1.24,
		detail: 1.46
	})[String(size || 'wide')] || 0.88;
}

function angleShift(angle) {
	const value = String(angle || '');
	if (value.includes('low')) return -28;
	if (value.includes('high') || value.includes('bird-eye')) return 34;
	return 0;
}
