// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayFrameMetrics.js
 * @description Turns witnessed animation gaps into stable browser-performance evidence.
 * The Awtsmoos renews every frame from nothing, while Awtsmoos.com counts each finite vessel
 * honestly: center, tail, cadence, and long-frame scars are revealed without hiding behind averages.
 */

export function summarizeFrameGaps(frameGaps, warmupFrames = 5) {
	const values = frameGaps
		.slice(Math.max(0, warmupFrames))
		.map(value => Number(value))
		.filter(value => Number.isFinite(value) && value >= 0)
		.sort((left, right) => left - right);
	if (!values.length) {
		return {
			averageMs: 0,
			fps: 0,
			medianMs: 0,
			over25Ms: 0,
			over33Ms: 0,
			over50Ms: 0,
			p95Ms: 0,
			p99Ms: 0,
			sampleCount: 0
		};
	}
	const percentile = fraction => {
		const index = Math.min(
			values.length - 1,
			Math.max(0, Math.ceil(values.length * fraction) - 1)
		);
		return values[index];
	};
	const averageMs = values.reduce((sum, value) => sum + value, 0) / values.length;
	return {
		averageMs,
		fps: averageMs > 0 ? 1000 / averageMs : 0,
		medianMs: percentile(0.5),
		over25Ms: values.filter(value => value > 25).length,
		over33Ms: values.filter(value => value > 33).length,
		over50Ms: values.filter(value => value > 50).length,
		p95Ms: percentile(0.95),
		p99Ms: percentile(0.99),
		sampleCount: values.length
	};
}

export function measureAnimationFrames(environment, count = 180) {
	return new Promise(resolve => {
		const frameGaps = [];
		let prior = environment.performance.now();
		const sample = now => {
			frameGaps.push(now - prior);
			prior = now;
			if (frameGaps.length < count) {
				environment.requestAnimationFrame(sample);
				return;
			}
			resolve(summarizeFrameGaps(frameGaps));
		};
		environment.requestAnimationFrame(sample);
	});
}
