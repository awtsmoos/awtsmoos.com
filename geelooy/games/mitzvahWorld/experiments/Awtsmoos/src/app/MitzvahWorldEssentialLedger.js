// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLedger.js
 * @description Owns lifecycle transitions for five essential facts while deadline policy and timing remain separate vessels.
 * The Awtsmoos joins dependency to dependency without lending tomorrow's clock to today's light;
 * Awtsmoos.com lets each fact begin when ready, while one bounded first-play covenant still guards the night.
 */

import {
	cancelMitzvahWorldEssentialTimeout,
	readMitzvahWorldEssentialTime,
	scheduleMitzvahWorldEssentialTimeout
} from './MitzvahWorldEssentialClock.js';
import {
	essentialDeadlineFailure,
	essentialDependencyFailure,
	timeoutDetails
} from './MitzvahWorldEssentialDeadlinePolicy.js';
import { ESSENTIAL_MILESTONE_CATALOG } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { presentMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import {
	applyEssentialDetails,
	createEssentialRecord,
	isEssentialTerminal
} from './MitzvahWorldEssentialRecord.js';
import { createMitzvahWorldEssentialSnapshot } from './MitzvahWorldEssentialSnapshot.js';
import {
	activateReadyEssentialRecords,
	firstActiveEssentialRecord,
	firstTimedOutEssentialRecord
} from './MitzvahWorldEssentialTiming.js';

export class MitzvahWorldEssentialLedger {
	constructor(environment) {
		this.environment = environment;
		this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
		this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(definition => [definition.name, createEssentialRecord(definition)]));
		activateReadyEssentialRecords(this.records, this.startedAtMilliseconds);
		this.timer = scheduleMitzvahWorldEssentialTimeout(environment, () => this.timeout());
		this.publish();
	}

	update(name, details = {}) {
		const record = this.requireRecord(name);
		if (!isEssentialTerminal(record.status)) applyEssentialDetails(record, details);
		return this.publish();
	}

	complete(name, details = {}) {
		const record = this.requireRecord(name);
		if (isEssentialTerminal(record.status)) return this.snapshot();
		const missing = record.dependencies.find(dependency => this.records.get(dependency)?.status !== 'complete');
		if (missing) return this.fail(name, essentialDependencyFailure(details, missing));
		const currentTime = readMitzvahWorldEssentialTime(this.environment);
		activateReadyEssentialRecords(this.records, currentTime);
		const deadlineFailure = essentialDeadlineFailure(record, currentTime, this.startedAtMilliseconds, details);
		if (deadlineFailure) return this.fail(name, deadlineFailure);
		applyEssentialDetails(record, details);
		record.status = 'complete';
		record.completedAtMilliseconds = currentTime;
		record.elapsedMilliseconds = currentTime - record.startedAtMilliseconds;
		activateReadyEssentialRecords(this.records, currentTime);
		this.clearTimerIfFinished();
		return this.publish();
	}

	fail(name, details = {}) {
		const record = this.requireRecord(name);
		if (isEssentialTerminal(record.status)) return this.snapshot();
		const currentTime = readMitzvahWorldEssentialTime(this.environment);
		applyEssentialDetails(record, details);
		record.status = details.status || 'failed';
		record.failureCode = details.failureCode || 'ESSENTIAL_BOOT_FAILURE';
		record.failureMessage = details.failureMessage || null;
		record.failedAtMilliseconds = currentTime;
		record.elapsedMilliseconds = currentTime - (record.startedAtMilliseconds ?? this.startedAtMilliseconds);
		cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
		const snapshot = this.publish();
		presentMitzvahWorldEssentialFailure(this.environment, snapshot.stalledMilestone);
		return snapshot;
	}

	timeout() {
		const currentTime = readMitzvahWorldEssentialTime(this.environment);
		const overdue = firstTimedOutEssentialRecord(this.records, currentTime);
		const record = overdue || firstActiveEssentialRecord(this.records);
		if (!record) return this.publish();
		const code = overdue ? record.timeoutFailureCode : 'ESSENTIAL_FIRST_PLAY_DEADLINE_EXCEEDED';
		return this.fail(record.name, timeoutDetails(record, {}, code));
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

	clearTimerIfFinished() {
		if ([...this.records.values()].every(record => isEssentialTerminal(record.status))) {
			cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
		}
	}
}
