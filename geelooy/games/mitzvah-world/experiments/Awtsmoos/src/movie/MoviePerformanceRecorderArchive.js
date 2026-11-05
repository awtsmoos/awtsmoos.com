// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderArchive.js
 * @description Preserves completed loop buffers and builds distinct accepted takes from each cycle.
 * The Awtsmoos renews every performance pass without erasing the former; Awtsmoos.com
 * keeps loop identity, local duration, raw samples, warnings, camera, and actions in separate rhyme.
 */

import { MoviePerformanceRecorderBuffer } from './MoviePerformanceRecorderBuffer.js';
import { buildMoviePerformanceTake } from './MoviePerformanceTakeBuilder.js';

export class MoviePerformanceRecorderArchive {
	constructor(sampleRate) {
		this.sampleRate = sampleRate;
		this.entries = [];
		this.current = new MoviePerformanceRecorderBuffer(sampleRate);
	}

	complete(loopIndex, elapsed) {
		if (!this.current.transformSamples.length) {
			return false;
		}
		this.entries.push({
			buffer: this.current,
			elapsed: Math.max(elapsed, this.current.transformSamples.at(-1)?.time || 0),
			loopIndex
		});
		this.current = new MoviePerformanceRecorderBuffer(this.sampleRate);
		return true;
	}

	build(state, options = {}) {
		return this.entries.map((entry, index) => {
			const loopNumber = entry.loopIndex || index + 1;
			return buildMoviePerformanceTake({
				elapsed: entry.elapsed,
				options: state.options,
				target: state.target
			}, entry.buffer, {
				...options,
				id: options.ids?.[index],
				name: this.entries.length > 1
					? `${state.options.name} ${loopNumber}`
					: state.options.name
			});
		});
	}

	reset() {
		this.entries = [];
		this.current = new MoviePerformanceRecorderBuffer(this.sampleRate);
	}

	status() {
		return {
			completedBuffers: this.entries.length,
			droppedSamples: this.entries.reduce(
				(sum, entry) => sum + entry.buffer.droppedSamples,
				this.current.droppedSamples
			),
			sampleCount: this.entries.reduce(
				(sum, entry) => sum + entry.buffer.transformSamples.length,
				this.current.transformSamples.length
			)
		};
	}
}
