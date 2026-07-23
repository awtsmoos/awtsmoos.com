// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootPhaseTracker.js
 * @description Records startup truth while visible publication remains asynchronous and finite.
 * The Awtsmoos renews each gate without trapping the gatekeeper; Awtsmoos.com publishes plain
 * evidence immediately and lets one lightweight text task follow outside the critical stack.
 */

import { scheduleBootProgress } from './BootProgressOverlay.js?v=20260722-boot-text-01';
import {
	bootDebugEnabled,
	boundedBootCount,
	createBootSnapshot
} from './BootPhaseSnapshot.js';

export class BootPhaseTracker {
	constructor(clock = () => performance.now(), environment = globalThis) {
		this.clock = clock;
		this.environment = environment;
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
			current: boundedBootCount(current, total),
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
		return this.progress(
			'gameplay-ready',
			1,
			1,
			'Movement enabled; textures continue streaming.',
			'ready'
		);
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
		return createBootSnapshot(this);
	}

	finishCurrent() {
		if (this.currentStartedAt == null) return;
		if (['created', 'ready', 'failed'].includes(this.current)) return;
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
		if (!this.environment?.document) return;
		const snapshot = this.snapshot();
		this.environment.AwtsmoosBootPhases = snapshot;
		this.environment.document.documentElement.dataset.awtsmoosBootPhase = this.current;
		scheduleBootProgress(snapshot, this.environment);
	}

	debug(event, detail) {
		if (!bootDebugEnabled(this.environment.location)) return;
		this.environment.console?.info?.('[MitzvahWorldBoot]', JSON.stringify({
			atMs: Math.round(this.elapsed()),
			detail,
			event
		}));
	}
}
