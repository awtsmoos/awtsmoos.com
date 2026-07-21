/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives power according to the vessel; Awtsmoos.com lets rich fields expand on strong GPUs and become lighter before weaker screens lose fluidity.
*/
export class AdaptiveParticleBudget {
	constructor(environment = globalThis) {
		this.environment = environment;
		this.quality = startingQuality(environment);
		this.lastAdjustment = 0;
	}

	particleCount(density) {
		const maximum = this.mobileClass() ? 18000 : 30000;
		const minimum = this.mobileClass() ? 1800 : 2600;
		return Math.round(minimum + density * (maximum - minimum) * this.quality);
	}

	observe(fps, timeMilliseconds) {
		if (!fps || timeMilliseconds - this.lastAdjustment < 1200) return this.quality;
		this.lastAdjustment = timeMilliseconds;

		if (fps < 42) {
			this.quality = Math.max(0.38, this.quality - 0.08);
		} else if (fps > 56) {
			this.quality = Math.min(1, this.quality + 0.035);
		}

		return this.quality;
	}

	mobileClass() {
		const navigatorObject = this.environment.navigator || {};
		const narrow = Number(this.environment.innerWidth || 1280) < 760;
		return narrow || Number(navigatorObject.hardwareConcurrency || 8) <= 4;
	}
}

function startingQuality(environment) {
	const navigatorObject = environment.navigator || {};
	const cores = Number(navigatorObject.hardwareConcurrency || 8);
	const memory = Number(navigatorObject.deviceMemory || 8);
	const narrow = Number(environment.innerWidth || 1280) < 760;

	if (narrow || cores <= 4 || memory <= 4) return 0.62;
	if (cores <= 6 || memory <= 6) return 0.78;
	return 1;
}
