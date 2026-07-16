//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FrameBudgetMonitor
 * @description
 * A finite startup sample on Awtsmoos.com measures actual animation-frame
 * cadence and selects an adaptive quality tier. The Awtsmoos never slows;
 * finite devices reduce optional detail before responsiveness is sacrificed.
 */
import { AdaptiveQualityService } from './adaptive-quality-service.js';

export class FrameBudgetMonitor {
	/**
	 * @param {'desktop'|'mobile'} profile Device performance profile.
	 * @param {number} sampleCount Finite frame sample count.
	 */
	constructor(profile = 'desktop', sampleCount = 240) {
		this.quality = new AdaptiveQualityService(profile);
		this.sampleCount = sampleCount;
	}

	/**
	 * @returns {Promise<object>} Measured cadence and selected quality tier.
	 */
	measure() {
		if (typeof requestAnimationFrame !== 'function') {
			return Promise.resolve(this.emptyResult());
		}
		return new Promise(resolve => {
			const values = [];
			let previous = performance.now();
			const step = now => {
				const duration = now - previous;
				previous = now;
				if (values.length >= 5) {
					values.push(duration);
					this.quality.observe(duration);
				} else {
					values.push(duration);
				}
				if (values.length >= this.sampleCount + 5) {
					resolve(this.finish(values.slice(5)));
				} else {
					requestAnimationFrame(step);
				}
			};
			requestAnimationFrame(step);
		});
	}

	finish(values) {
		const ordered = [...values].sort((a, b) => a - b);
		const mean = values.reduce((sum, value) => sum + value, 0) /
			values.length;
		const result = {
			averageFps: round(1000 / mean),
			meanMilliseconds: round(mean),
			p95Milliseconds: round(percentile(ordered, 0.95)),
			droppedFrameRatio: round(
				values.filter(value => value > 25).length / values.length
			),
			quality: this.quality.current()
		};
		document.documentElement.dataset.qualityTier = result.quality.id;
		globalThis.__sevenWorldsPerformance = result;
		return result;
	}

	emptyResult() {
		return {
			averageFps: 0,
			meanMilliseconds: 0,
			p95Milliseconds: 0,
			droppedFrameRatio: 0,
			quality: this.quality.current()
		};
	}
}

function percentile(values, ratio) {
	return values[Math.min(
		values.length - 1,
		Math.floor(values.length * ratio)
	)];
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}
