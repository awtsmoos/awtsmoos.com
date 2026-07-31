// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowParticleMotion.js
 * @description Defines deterministic motion and scale envelopes for bounded combat sparks.
 * The Awtsmoos renews each fragment without chaos or waste; Awtsmoos.com lets every visible
 * letter arc and return to its pool while the frame remains a measured vessel of living light.
 */

export function particleMotion(kind, index, count) {
	const turn = index / Math.max(1, count) * Math.PI * 2;
	const direction = index % 2 === 0 ? 1 : -1;
	const lane = index % 4;
	const speed = kind === 'trail' ? 0.22 + lane * 0.055 : 1.05 + lane * 0.28;
	return {
		spin: direction * (1.8 + lane * 0.35),
		velocity: {
			x: Math.cos(turn) * speed,
			y: kind === 'trail' ? 0.1 + lane * 0.035 : 0.5 + lane * 0.14,
			z: Math.sin(turn) * speed
		}
	};
}

export function particleEnvelope(kind, progress, baseScale, index) {
	const safeProgress = Math.max(0, Math.min(1, progress));
	const pulse = 0.82 + Math.sin((safeProgress * 2.4 + index * 0.17) * Math.PI) * 0.18;
	const fade = Math.pow(1 - safeProgress, kind === 'trail' ? 1.35 : 0.8);
	const stretch = kind === 'trail' ? 1.7 : 1 + (index % 3) * 0.18;
	return {
		scaleX: Math.max(0.008, baseScale * pulse * fade),
		scaleY: Math.max(0.008, baseScale * pulse * fade * stretch),
		scaleZ: Math.max(0.008, baseScale * pulse * fade)
	};
}

export function coreEnvelope(progress) {
	const safeProgress = Math.max(0, Math.min(1, progress));
	const bloom = Math.sin(safeProgress * Math.PI);
	return {
		inner: Math.max(0.01, bloom * 0.46),
		outer: Math.max(0.01, bloom * (0.7 + safeProgress * 0.45))
	};
}
