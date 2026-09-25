// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLedger.js
 * @description Owns five essential facts while one watchdog observes each fact's silence and the whole first-play horizon.
 * The Awtsmoos joins dependency to dependency without mistaking active revelation for delay;
 * Awtsmoos.com refreshes only the fact that truly progressed while every silent sibling keeps its own finite night.
 */

import { readMitzvahWorldEssentialTime } from './MitzvahWorldEssentialClock.js';
import { essentialDeadlineFailure, essentialDependencyFailure, timeoutDetails } from './MitzvahWorldEssentialDeadlinePolicy.js';
import { ESSENTIAL_MILESTONE_CATALOG } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { presentMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import { applyEssentialDetails, createEssentialRecord, isEssentialTerminal } from './MitzvahWorldEssentialRecord.js';
import { createMitzvahWorldEssentialSnapshot } from './MitzvahWorldEssentialSnapshot.js';
import { activateReadyEssentialRecords, firstActiveEssentialRecord, firstTimedOutEssentialRecord, touchEssentialRecord } from './MitzvahWorldEssentialTiming.js';
import { MitzvahWorldEssentialWatchdog, essentialHardTimeoutReached } from './MitzvahWorldEssentialWatchdog.js';

export class MitzvahWorldEssentialLedger {
	constructor(environment) {
		this.environment = environment;
		this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
		this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(item => [item.name, createEssentialRecord(item)]));
		activateReadyEssentialRecords(this.records, this.startedAtMilliseconds);
		this.watchdog = new MitzvahWorldEssentialWatchdog(environment, this.startedAtMilliseconds, () => this.timeout());
		this.rearmWatchdog(this.startedAtMilliseconds);
		this.publish();
	}

	update(name, details = {}) {
		const record = this.requireRecord(name);
		if (!isEssentialTerminal(record.status)) {
			const now = readMitzvahWorldEssentialTime(this.environment);
			applyEssentialDetails(record, details);
			touchEssentialRecord(record, now);
			this.rearmWatchdog(now);
		}
		return this.publish();
	}

	complete(name, details = {}) {
		const record = this.requireRecord(name);
		if (isEssentialTerminal(record.status)) return this.snapshot();
		const missing = record.dependencies.find(dependency => this.records.get(dependency)?.status !== 'complete');
		if (missing) return this.fail(name, essentialDependencyFailure(details, missing));
		const now = readMitzvahWorldEssentialTime(this.environment);
		const failure = essentialDeadlineFailure(record, now, this.startedAtMilliseconds, details);
		if (failure) return this.fail(name, failure);
		applyEssentialDetails(record, details);
		record.lastProgressAtMilliseconds = now;
		record.status = 'complete';
		record.completedAtMilliseconds = now;
		record.elapsedMilliseconds = now - record.startedAtMilliseconds;
		activateReadyEssentialRecords(this.records, now);
		this.rearmWatchdog(now);
		return this.publish();
	}

	fail(name, details = {}) {
		const record = this.requireRecord(name);
		if (isEssentialTerminal(record.status)) return this.snapshot();
		const now = readMitzvahWorldEssentialTime(this.environment);
		applyEssentialDetails(record, details);
		record.status = details.status || 'failed';
		record.failureCode = details.failureCode || 'ESSENTIAL_BOOT_FAILURE';
		record.failureMessage = details.failureMessage || null;
		record.failedAtMilliseconds = now;
		record.elapsedMilliseconds = now - (record.startedAtMilliseconds ?? this.startedAtMilliseconds);
		this.cancelWatchdog();
		const snapshot = this.publish();
		presentMitzvahWorldEssentialFailure(this.environment, snapshot.stalledMilestone);
		return snapshot;
	}

	timeout() {
		const now = readMitzvahWorldEssentialTime(this.environment);
		const overdue = firstTimedOutEssentialRecord(this.records, now);
		if (overdue) return this.fail(overdue.name, timeoutDetails(overdue, {}, overdue.timeoutFailureCode));
		if (essentialHardTimeoutReached(now, this.startedAtMilliseconds)) {
			const record = firstActiveEssentialRecord(this.records);
			if (record) return this.fail(record.name, timeoutDetails(record, {}, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT'));
		}
		this.rearmWatchdog(now);
		return this.publish();
	}

	cancelWatchdog() {
		this.watchdog?.cancel();
		this.timer = null;
	}

	publish() {
		const snapshot = this.snapshot();
		this.environment.AwtsmoosMitzvahWorldEssentialBoot = snapshot;
		return snapshot;
	}

	snapshot() {
		return createMitzvahWorldEssentialSnapshot(this.records, this.startedAtMilliseconds, this.environment);
	}

	requireRecord(name) {
		const record = this.records.get(name);
		if (!record) throw new Error(`Unknown essential Mitzvah World milestone: ${name}`);
		return record;
	}

	rearmWatchdog(now) {
		if ([...this.records.values()].every(record => isEssentialTerminal(record.status))) return this.cancelWatchdog();
		this.timer = this.watchdog.rearm(this.records, now);
	}
}
