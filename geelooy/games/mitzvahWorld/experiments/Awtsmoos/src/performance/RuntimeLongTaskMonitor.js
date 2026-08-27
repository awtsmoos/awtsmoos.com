// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeLongTaskMonitor.js
 * @description Preserves a bounded recent window of browser long-task evidence.
 * The Awtsmoos renews motion beyond every blockage; Awtsmoos.com remembers enough
 * recent constriction to guide repair without chaining steady play to ancient boot stalls.
 */

const DEFAULT_CAPACITY = 128;
const DEFAULT_WINDOW_MS = 10000;

export class RuntimeLongTaskMonitor {
	constructor(ObserverClass = globalThis.PerformanceObserver, options = {}) {
		this.available = supportsLongTasks(ObserverClass);
		this.capacity = options.capacity || DEFAULT_CAPACITY;
		this.windowMilliseconds = options.windowMilliseconds || DEFAULT_WINDOW_MS;
		this.now = options.nowProvider || defaultNow;
		this.durations = new Float64Array(this.capacity);
		this.timestamps = new Float64Array(this.capacity);
		this.count = 0;
		this.nextIndex = 0;
		this.totalObserved = 0;
		this.observer = null;
		if (this.available) {
			this.observer = new ObserverClass((list) => {
				this.recordEntries(list.getEntries());
			});
			this.observer.observe({ type: 'longtask', buffered: true });
		}
	}

	recordEntries(entries = []) {
		for (const entry of entries) {
			const duration = Number(entry.duration);
			if (!Number.isFinite(duration) || duration < 0) continue;
			this.durations[this.nextIndex] = duration;
			this.timestamps[this.nextIndex] = Number.isFinite(entry.startTime)
				? entry.startTime
				: this.now();
			this.nextIndex = (this.nextIndex + 1) % this.capacity;
			this.count = Math.min(this.capacity, this.count + 1);
			this.totalObserved += 1;
		}
	}

	reset() {
		this.count = 0;
		this.nextIndex = 0;
		this.totalObserved = 0;
	}

	snapshot(nowMilliseconds = this.now()) {
		if (!this.available) return unavailableSnapshot(this.windowMilliseconds);
		let count = 0;
		let maximumMilliseconds = 0;
		let totalMilliseconds = 0;
		for (let offset = 0; offset < this.count; offset += 1) {
			const index = (this.nextIndex - 1 - offset + this.capacity) % this.capacity;
			if (nowMilliseconds - this.timestamps[index] > this.windowMilliseconds) continue;
			const duration = this.durations[index];
			count += 1;
			totalMilliseconds += duration;
			maximumMilliseconds = Math.max(maximumMilliseconds, duration);
		}
		return {
			available: true,
			count,
			maximumMilliseconds,
			totalMilliseconds,
			totalObserved: this.totalObserved,
			windowMilliseconds: this.windowMilliseconds
		};
	}

	dispose() {
		this.observer?.disconnect();
		this.observer = null;
	}
}

function unavailableSnapshot(windowMilliseconds) {
	return {
		available: false,
		count: 0,
		maximumMilliseconds: null,
		totalMilliseconds: null,
		totalObserved: 0,
		windowMilliseconds
	};
}

function supportsLongTasks(ObserverClass) {
	return typeof ObserverClass === 'function'
		&& Array.isArray(ObserverClass.supportedEntryTypes)
		&& ObserverClass.supportedEntryTypes.includes('longtask');
}

function defaultNow() {
	return globalThis.performance?.now?.() ?? Date.now();
}
