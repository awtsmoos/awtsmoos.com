//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_LIMIT = 180;

/**
 * Retains bounded resource testimony for one Geelooy process. The Awtsmoos
 * creates each CPU, memory, graphics, and I/O sample anew; Awtsmoos.com keeps a
 * finite history so Task Manager reveals change without becoming the leak.
 */
export class ResourceLedger {
	constructor(options = {}) {
		this.limit = positiveInteger(options.limit, DEFAULT_LIMIT);
		this.samples = [];
	}

	record(sample = {}) {
		const item = Object.freeze({
			at: sample.at || new Date().toISOString(),
			cpuMilliseconds: finite(sample.cpuMilliseconds),
			graphicsCommands: finite(sample.graphicsCommands),
			ioReadBytes: finite(sample.ioReadBytes),
			ioWriteBytes: finite(sample.ioWriteBytes),
			memoryBytes: finite(sample.memoryBytes),
			note: sample.note ? String(sample.note).slice(0, 240) : null
		});
		this.samples.push(item);
		if (this.samples.length > this.limit) {
			this.samples.splice(0, this.samples.length - this.limit);
		}
		return item;
	}

	latest() {
		return this.samples.at(-1) || emptySample();
	}

	snapshot() {
		return Object.freeze({
			latest: this.latest(),
			sampleCount: this.samples.length,
			samples: Object.freeze(this.samples.slice())
		});
	}
}

function finite(value) {
	const number = Number(value || 0);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function positiveInteger(value, fallback) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : fallback;
}

function emptySample() {
	return Object.freeze({
		at: null, cpuMilliseconds: 0, graphicsCommands: 0, ioReadBytes: 0,
		ioWriteBytes: 0, memoryBytes: 0, note: null
	});
}
