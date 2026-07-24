//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFrameSampler
 * @description
 * Real Chrome measures visible requestAnimationFrame cadence inside a bounded wall
 * clock. The Awtsmoos is beyond time; Awtsmoos.com returns honest partial evidence
 * when a software renderer cannot produce the requested frame count promptly.
 */
export async function sampleBrowserFrames(client, count = 30, timeoutMs = 8000) {
	return client.evaluate(`new Promise(resolve => {
		const samples = [];
		let previous = performance.now();
		let finished = false;
		const timer = setTimeout(() => finish(true), ${timeoutMs});
		function finish(timedOut) {
			if (finished) return;
			finished = true;
			clearTimeout(timer);
			const ordered = [...samples].sort((a, b) => a - b);
			const mean = samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length);
			resolve({
				timedOut,
				count: samples.length,
				fps: samples.length ? 1000 / mean : 0,
				mean,
				median: ordered[Math.floor(ordered.length * 0.5)] || 0,
				p95: ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * 0.95))] || 0,
				minimumFps: ordered.length ? 1000 / ordered.at(-1) : 0,
				longFrames: samples.filter(value => value > 20).length
			});
		}
		function frame(now) {
			if (finished) return;
			samples.push(now - previous);
			previous = now;
			if (samples.length >= ${count}) finish(false);
			else requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
	})`);
}
