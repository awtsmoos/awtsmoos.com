// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLedger.js
 * @description Owns five essential facts while one watchdog observes each fact's silence and the whole horizon.
 * The Awtsmoos joins dependency to dependency without mistaking revelation for delay; Awtsmoos.com refreshes only
 * the fact that truly progressed while every silent sibling keeps its own finite night. A silence timeout names missing
 * evidence, never a broken vessel: the real proof may still arrive late, and witnesses may testify at a deadline.
 */

import { readMitzvahWorldEssentialTime } from './MitzvahWorldEssentialClock.js';
import { ESSENTIAL_HARD_TIMEOUT_CODE, essentialDeadlineFailure, essentialDependencyFailure } from './MitzvahWorldEssentialDeadlinePolicy.js';
import {
	ESSENTIAL_MILESTONES,
	ESSENTIAL_MILESTONE_CATALOG,
	SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS
} from './MitzvahWorldEssentialMilestoneCatalog.js';
import { resolveEssentialWatchdogTimeout } from './MitzvahWorldEssentialFrameProof.js';
import { dismissMitzvahWorldEssentialFailure, presentMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import { applyEssentialDetails, clearEssentialFailure, createEssentialRecord, isEssentialTerminal } from './MitzvahWorldEssentialRecord.js';
import { createMitzvahWorldEssentialSnapshot } from './MitzvahWorldEssentialSnapshot.js';
import { syncMitzvahWorldEssentialSlowGraphicsNotice } from './MitzvahWorldEssentialSlowGraphicsNotice.js';
import { readMitzvahWorldWebGlCapability } from './MitzvahWorldWebGlCapabilityGate.js';
import { activateReadyEssentialRecords, touchEssentialRecord } from './MitzvahWorldEssentialTiming.js';
import { MitzvahWorldEssentialWatchdog } from './MitzvahWorldEssentialWatchdog.js';

export class MitzvahWorldEssentialLedger {
	constructor(environment) {
		this.environment = environment;
		this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
		this.lastProgressAtMilliseconds = this.startedAtMilliseconds;
		this.firstPlayLaunchBegun = false;
		this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(item => [item.name, createEssentialRecord(item)]));
		this.launchWitness = this.menuWitness = null;
		this.softwareRenderer = readMitzvahWorldWebGlCapability(environment)?.softwareRenderer === true;
		if (this.softwareRenderer) {
			const firstFrame = this.records.get(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
			if (firstFrame) firstFrame.timeoutMilliseconds = SOFTWARE_RENDERER_FIRST_FRAME_DEADLINE_MS;
		}
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
			this.lastProgressAtMilliseconds = now;
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
			const failure = essentialDeadlineFailure(record, now, this.startedAtMilliseconds, details, this.progressFloorFor(record));
			if (failure) return this.fail(name, failure);
		}
		applyEssentialDetails(record, details);
		record.lastProgressAtMilliseconds = now;
		this.lastProgressAtMilliseconds = now;
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
			let donor = null;
			for (const candidate of this.records.values()) {
				if (candidate === record || !candidate.resourceUrl) continue;
				const progress = candidate.lastProgressAtMilliseconds ?? candidate.startedAtMilliseconds ?? -1;
				if (!donor || progress > donor.progress) donor = { candidate, progress };
			}
			if (donor) {
				details = {
					...details,
					resourceStatus: details.resourceStatus ?? donor.candidate.resourceStatus ?? null,
					resourceUrl: donor.candidate.resourceUrl
				};
				if ((details.importerStage == null || details.importerStage === 'essential-boot')
					&& record.importerStage == null && donor.candidate.importerStage != null) {
					details = { ...details, importerStage: donor.candidate.importerStage };
				}
			}
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
		syncMitzvahWorldEssentialSlowGraphicsNotice(this.environment, snapshot, {
			launchBegun: this.firstPlayLaunchBegun === true,
			softwareRenderer: this.softwareRenderer
		});
		return snapshot;
	}

	snapshot() {
		return createMitzvahWorldEssentialSnapshot(this.records, this.startedAtMilliseconds, this.environment, {
			softwareRenderer: this.softwareRenderer
		});
	}

	/**
	 * The first-frame fact alone is judged against boot-wide progress: any witnessed
	 * update or completion anywhere in the ledger proves the boot is still alive.
	 * Every other fact returns null and keeps its own strict per-fact silence.
	 */
	progressFloorFor(record) {
		return record.name === ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME
			? this.lastProgressAtMilliseconds
			: null;
	}

	requireRecord(name) {
		const record = this.records.get(name);
		if (!record) throw new Error(`Unknown essential Mitzvah World milestone: ${name}`);
		return record;
	}

	rearmWatchdog(now) {
		if ([...this.records.values()].every(record => isEssentialTerminal(record.status))) return this.cancelWatchdog();
		this.timer = this.watchdog.rearm(this.records, now, record => this.progressFloorFor(record));
	}
}
