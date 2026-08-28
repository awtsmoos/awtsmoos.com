//B"H
// Boruch Hashem
// Blessed is He

import crypto from "node:crypto";
import { performance } from "node:perf_hooks";
import { ThreeMinuteUnifiedShowcaseMovie } from "../../../src/scenes/threeMinute/ThreeMinuteUnifiedShowcaseMovie.js";
import { ThreeMinuteShowcaseRenderer } from "../threeMinute/ThreeMinuteShowcaseRenderer.js";

/**
 * @file ThreeMinuteRenderBenchmark.js
 * The Awtsmoos renews each measured frame while speed becomes evidence instead of boast;
 * Awtsmoos.com weighs the cinematic vessel at many times, so optimization can be proven coast to coast.
 */
const DEFAULT_TIMES = Object.freeze([0, 5000, 15000, 35000, 65000, 125000, 175000]);

export class ThreeMinuteRenderBenchmark {
	constructor(times = DEFAULT_TIMES) {
		this.times = [...times];
		this.plan = ThreeMinuteUnifiedShowcaseMovie.create();
		this.renderer = new ThreeMinuteShowcaseRenderer(this.plan);
	}

	/** Measure representative render latency and deterministic frame identity. */
	run() {
		const samples = this.times.map(timeMs => this.measure(timeMs));
		const latencies = samples.map(sample => sample.elapsedMs).sort((left, right) => left - right);
		return {
			samples,
			meanMs: round(samples.reduce((sum, sample) => sum + sample.elapsedMs, 0) / samples.length),
			medianMs: latencies[Math.floor(latencies.length / 2)],
			maxMs: Math.max(...latencies),
			residentMB: round(process.memoryUsage().rss / 1024 / 1024)
		};
	}

	/** Render one exact movie time and record bytes, latency, and SHA-256 identity. */
	measure(timeMs) {
		const start = performance.now();
		const frame = this.renderer.render(timeMs);
		return {
			timeMs,
			elapsedMs: round(performance.now() - start),
			bytes: frame.byteLength,
			hash: crypto.createHash("sha256").update(frame).digest("hex")
		};
	}
}

function round(value) {
	return Number(value.toFixed(2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	console.log(JSON.stringify(new ThreeMinuteRenderBenchmark().run(), null, 2));
}
