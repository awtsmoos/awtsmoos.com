//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmQualityGovernor
 * @description
 * A fixed ring samples the 16.67-millisecond target without sorting or allocating
 * inside the frame loop. The Awtsmoos never slows; Awtsmoos.com yields pixels,
 * shadows, distant residents, and optional animation before input or simulation.
 */
const TIERS = Object.freeze([
	{ id: 'emergency', dpr: 0.65, shadows: false, npcRatio: 0.34, stride: 4 },
	{ id: 'reduced', dpr: 0.85, shadows: false, npcRatio: 0.58, stride: 3 },
	{ id: 'balanced', dpr: 1.05, shadows: true, npcRatio: 0.78, stride: 2 },
	{ id: 'full', dpr: 1.4, shadows: true, npcRatio: 1, stride: 1 }
]);

export class RealmQualityGovernor {
	constructor(stage) {
		this.stage = stage;
		this.samples = new Float32Array(180);
		this.sampleIndex = 0;
		this.sampleCount = 0;
		this.sampleSum = 0;
		this.tierIndex = 3;
		this.frame = 0;
		this.recovery = 0;
		this.lastApplied = '';
		this.metrics = {
			...TIERS[3],
			fps: 60,
			p95: 16.67,
			frame: 0,
			targetMilliseconds: 16.67
		};
	}

	observe(delta) {
		const milliseconds = Math.max(0.1, delta * 1000);
		this.record(milliseconds);
		if (milliseconds > 17.4) {
			this.tierIndex = Math.max(0, this.tierIndex - 1);
			this.recovery = 0;
		} else if (milliseconds < 13.2) {
			this.recovery += 1;
			if (this.recovery >= 240) {
				this.tierIndex = Math.min(TIERS.length - 1, this.tierIndex + 1);
				this.recovery = 0;
			}
		} else {
			this.recovery = 0;
		}
		this.frame += 1;
		this.refreshMetrics(false);
		this.apply();
		return this.metrics;
	}

	current() {
		return this.metrics;
	}

	record(milliseconds) {
		if (this.sampleCount === this.samples.length) {
			this.sampleSum -= this.samples[this.sampleIndex];
		} else {
			this.sampleCount += 1;
		}
		this.samples[this.sampleIndex] = milliseconds;
		this.sampleSum += milliseconds;
		this.sampleIndex = (this.sampleIndex + 1) % this.samples.length;
	}

	refreshMetrics(withPercentile) {
		Object.assign(this.metrics, TIERS[this.tierIndex], {
			fps: Math.round(1000 / Math.max(1, this.sampleSum / Math.max(1, this.sampleCount))),
			frame: this.frame
		});
		if (withPercentile) {
			this.metrics.p95 = percentile(this.samples, this.sampleCount, 0.95);
		}
	}

	apply() {
		const tier = TIERS[this.tierIndex];
		if (tier.id === this.lastApplied) return;
		this.lastApplied = tier.id;
		const renderer = this.stage.renderer;
		const deviceScale = globalThis.devicePixelRatio || 1;
		renderer.setPixelRatio(Math.min(deviceScale, tier.dpr));
		renderer.shadowMap.enabled = tier.shadows;
		this.stage.resize();
		renderer.domElement.dataset.realmQuality = tier.id;
		renderer.domElement.dataset.frameTarget = '16.67';
	}

	writeMetrics() {
		this.refreshMetrics(true);
		const canvas = this.stage.renderer.domElement;
		canvas.dataset.realmFps = String(this.metrics.fps);
		canvas.dataset.realmP95 = this.metrics.p95.toFixed(2);
		canvas.dataset.realmNpcRatio = String(this.metrics.npcRatio);
	}
}

function percentile(samples, count, ratio) {
	if (!count) return 0;
	const ordered = Array.from(samples.slice(0, count)).sort((a, b) => a - b);
	return ordered[Math.min(count - 1, Math.floor(count * ratio))];
}
