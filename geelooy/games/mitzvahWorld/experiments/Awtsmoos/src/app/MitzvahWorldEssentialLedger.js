// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLedger.js
 * @description Owns five essential facts while one watchdog observes each fact's silence and the whole first-play horizon.
 * The Awtsmoos joins dependency to dependency without mistaking active revelation for delay;
 * Awtsmoos.com refreshes only the fact that truly progressed while every silent sibling keeps its own finite night.
 * A silence timeout names missing evidence, never a broken vessel: the real proof may still arrive late.
 */

import { readMitzvahWorldEssentialTime } from './MitzvahWorldEssentialClock.js';
import { ESSENTIAL_HARD_TIMEOUT_CODE, essentialDeadlineFailure, essentialDependencyFailure } from './MitzvahWorldEssentialDeadlinePolicy.js';
import { ESSENTIAL_MILESTONE_CATALOG } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { resolveEssentialWatchdogTimeout } from './MitzvahWorldEssentialFrameProof.js';
import { dismissMitzvahWorldEssentialFailure, presentMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import { applyEssentialDetails, clearEssentialFailure, createEssentialRecord, isEssentialTerminal } from './MitzvahWorldEssentialRecord.js';
import { createMitzvahWorldEssentialSnapshot } from './MitzvahWorldEssentialSnapshot.js';
import { activateReadyEssentialRecords, touchEssentialRecord } from './MitzvahWorldEssentialTiming.js';
import { MitzvahWorldEssentialWatchdog } from './MitzvahWorldEssentialWatchdog.js';

export class MitzvahWorldEssentialLedger {
	constructor(environment) {
		this.environment = environment;
		this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
		this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(item => [item.name, createEssentialRecord(item)]));
		this.frameProver = null;
		this.frameProofAttempted = false;
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
		const reviving = record.status === 'timed-out' && record.failureCode !== ESSENTIAL_HARD_TIMEOUT_CODE;
		if (isEssentialTerminal(record.status) && !reviving) return this.snapshot();
		const missing = record.dependencies.find(dependency => this.records.get(dependency)?.status !== 'complete');
		if (missing) return this.fail(name, essentialDependencyFailure(details, missing));
		const now = readMitzvahWorldEssentialTime(this.environment);
		if (!reviving) {
			const failure = essentialDeadlineFailure(record, now, this.startedAtMilliseconds, details);
			if (failure) return this.fail(name, failure);
		}
		applyEssentialDetails(record, details);
		record.lastProgressAtMilliseconds = now;
		record.status = 'complete';
		record.completedAtMilliseconds = now;
		record.elapsedMilliseconds = now - record.startedAtMilliseconds;
		if (reviving) clearEssentialFailure(record);
		activateReadyEssentialRecords(this.records, now);
		this.rearmWatchdog(now);
		const snapshot = this.publish();
		if (reviving && !snapshot.stalledMilestone) dismissMitzvahWorldEssentialFailure(this.environment);
		return snapshot;
	}

	fail(name, details = {}) {
		const record = this.requireRecord(name);
		if (isEssentialTerminal(record.status)) return this.snapshot();
		const now = readMitzvahWorldEssentialTime(this.environment);
		if (!details.resourceUrl) {
			const donor = [...this.records.values()].find(candidate => candidate !== record && candidate.resourceUrl);
			if (donor) details = { ...details, resourceStatus: details.resourceStatus ?? donor.resourceStatus ?? null, resourceUrl: donor.resourceUrl };
		}
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
		return resolveEssentialWatchdogTimeout(this, readMitzvahWorldEssentialTime(this.environment));
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
