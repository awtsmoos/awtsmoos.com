// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootPhaseTracker.js
 * @description Records startup phases, progress, degradation, readiness, and fatal failure.
 * The Awtsmoos renews each threshold; Awtsmoos.com makes every boot gate visible and emits
 * precise debug beacons only when the explicit debugBoot query flag opens that vessel.
 */

import { renderBootProgress } from './BootProgressOverlay.js';

export class BootPhaseTracker {
	constructor(clock = () => performance.now()) {
		this.clock = clock;
		this.startedAt = clock();
		this.current = 'created';
		this.currentStartedAt = null;
		this.records = [];
		this.progressRecords = [];
		this.degraded = [];
		this.failure = null;
		this.publish();
	}

	begin(name) {
		this.finishCurrent();
		this.current = name;
		this.currentStartedAt = this.clock();
		this.debug('begin', { name });
		this.publish();
		return this;
	}

	progress(name, current, total, detail = '', status = 'loading') {
		const record = Object.freeze({
			atMs: this.elapsed(),
			current: boundedCount(current, total),
			detail: String(detail || ''),
			label: String(name || 'loading'),
			status,
			total: Math.max(0, Number(total) || 0)
		});
		const index = this.progressRecords.findIndex(item => item.label === record.label);
		if (index >= 0) this.progressRecords[index] = record;
		else this.progressRecords.push(record);
		this.publish();
		return this;
	}

	complete(name = this.current) {
		if (name === this.current) this.finishCurrent();
		this.current = 'ready';
		this.currentStartedAt = this.clock();
		this.debug('ready', { name });
		this.progress('gameplay-ready', 1, 1, 'Movement enabled; textures continue streaming.', 'ready');
		return this;
	}

	degrade(system, error) {
		this.degraded.push({
			atMs: this.elapsed(),
			error: error?.message || String(error),
			system
		});
		this.debug('degraded', { error: error?.message || String(error), system });
		this.publish();
		return this;
	}

	fail(error) {
		this.finishCurrent();
		this.current = 'failed';
		this.failure = {
			message: error?.message || String(error),
			stack: error?.stack || ''
		};
		this.debug('failed', this.failure);
		this.publish();
		return this;
	}

	snapshot() {
		return {
			current: this.current,
			degraded: structuredClone(this.degraded),
			elapsedMs: this.elapsed(),
			failure: this.failure ? { ...this.failure } : null,
			progress: structuredClone(this.progressRecords),
			records: structuredClone(this.records)
		};
	}

	finishCurrent() {
		if (this.currentStartedAt == null || ['created', 'ready', 'failed'].includes(this.current)) return;
		const record = {
			durationMs: this.clock() - this.currentStartedAt,
			name: this.current
		};
		this.records.push(record);
		this.debug('finish', record);
		this.currentStartedAt = null;
	}

	elapsed() {
		return this.clock() - this.startedAt;
	}

	publish() {
		if (typeof window === 'undefined') return;
		const snapshot = this.snapshot();
		window.AwtsmoosBootPhases = snapshot;
		document.documentElement.dataset.awtsmoosBootPhase = this.current;
		renderBootProgress(snapshot);
	}

	debug(event, detail) {
		if (!debugEnabled()) return;
		console.info('[MitzvahWorldBoot]', JSON.stringify({
			atMs: Math.round(this.elapsed()),
			detail,
			event
		}));
	}
}

function boundedCount(current, total) {
	const maximum = Math.max(0, Number(total) || 0);
	return Math.max(0, Math.min(maximum, Number(current) || 0));
}

function debugEnabled() {
	if (typeof location === 'undefined') return false;
	return new URLSearchParams(location.search).get('debugBoot') === '1';
}
