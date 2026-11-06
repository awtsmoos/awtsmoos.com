// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/admin/maintenance.js
 * @chapter Reclamation Runs On A Real Schedule, Never Inside The Request
 * @description
 * Scheduled reclamation (§8.3): run db.gc() after every import job and
 * every bulk publish, as a maintenance step under exclusive ownership
 * for that file — never inside the request path, and never while a
 * batch is in flight. Surfaces storage health (storageReport +
 * allocator.reuseVerification) and alerts when verify() fails or
 * unreachable bytes cross a threshold. A failed verify used to
 * silently switch the whole file to append-only; now it is an alert.
 *
 * Exclusive ownership: gc() verifies the live graph and adopts the
 * complement as the free list. A concurrent writer allocating during
 * that window could have its fresh bytes adopted as free. Callers must
 * therefore hold exclusive ownership for the file (an import job owns
 * its file; a bulk publish defers until its batch has closed), and
 * this module refuses to run while a batch is in flight or while
 * another maintenance run is active. The scheduled form is deferred
 * (setTimeout) so the request that triggered it is already answered.
 */

const DEFAULT_UNREACHABLE_ALERT_BYTES = 1024 * 1024 * 1024; // 1 GiB
const DEFAULT_UNREACHABLE_ALERT_FRACTION = 0.10; // 10% of logical bytes
const DEFAULT_SCHEDULE_DELAY_MS = 5000;

/**
 * Builds a storage report and the alerts it raises.
 * @param {object} db - Open AwtsmoosDB instance.
 * @param {object} [options={}] - Alert thresholds.
 * @returns {object} { report, alerts, ok }
 */
function checkStorageHealth(db, options = {}) {
	const report = db.storageReport({ verify: options.verify !== false });
	const alerts = [];
	const logical = Number(report.logicalBytes || 0);
	const unreachable = Number(report.unreachableLogicalBytes || 0);
	const threshold = Math.max(
		Number(options.unreachableAlertBytes || DEFAULT_UNREACHABLE_ALERT_BYTES),
		logical * Number(options.unreachableAlertFraction ?? DEFAULT_UNREACHABLE_ALERT_FRACTION)
	);

	if (!report.verification || report.verification.ok !== true) {
		alerts.push({
			code: 'VERIFY_FAILED',
			message: 'B"H storage verification failed — reuse is off and the file is append-only until this is fixed',
			errors: (report.verification && report.verification.errors) || []
		});
	}
	if (report.verification && report.verification.ok === true && unreachable > threshold) {
		alerts.push({
			code: 'UNREACHABLE_ABOVE_THRESHOLD',
			message: `B"H unreachable bytes ${unreachable} exceed threshold ${threshold} (logical ${logical})`,
			unreachableBytes: unreachable,
			thresholdBytes: threshold,
			logicalBytes: logical
		});
	}
	const reuse = report.reuseVerification || null;
	if (reuse && reuse.ok === false) {
		alerts.push({
			code: 'REUSE_VERIFICATION_FAILED',
			message: `B"H free-space reuse verification failed (state ${reuse.state})`,
			reuseVerification: reuse
		});
	}

	return { report, alerts, ok: alerts.length === 0 };
}

/**
 * Runs one synchronous maintenance gc() plus a health check.
 * The caller must hold exclusive ownership for this file.
 * @param {object} db - Open AwtsmoosDB instance.
 * @param {object} [options={}] - { logger, unreachableAlertBytes, unreachableAlertFraction, reason }
 * @returns {object} { ok, reason?, gc?, health? }
 */
function runMaintenanceGc(db, options = {}) {
	const logger = options.logger || console;
	if (!db || typeof db.gc !== 'function') {
		return { ok: false, reason: 'no-gc' };
	}
	if (db._maintenanceGcRunning) {
		return { ok: false, reason: 'already-running' };
	}
	if (db.pager && db.pager.isBatching === true) {
		return { ok: false, reason: 'batch-in-flight' };
	}
	db._maintenanceGcRunning = true;
	try {
		const gc = db.gc();
		const health = checkStorageHealth(db, options);
		const entry = {
			at: new Date().toISOString(),
			file: db.pager ? db.pager.filePath : null,
			reason: options.reason || 'maintenance',
			gc: {
				ok: gc.ok,
				errors: gc.errors,
				freeRanges: gc.freeRanges,
				freeBytes: gc.freeBytes,
				logicalBytes: gc.logicalBytes
			},
			unreachableLogicalBytes: health.report.unreachableLogicalBytes,
			reclaimableBytes: health.report.reclaimableBytes,
			alerts: health.alerts
		};
		if (typeof logger.info === 'function') logger.info(`B"H maintenance gc: ${JSON.stringify(entry)}`);
		else if (typeof logger.log === 'function') logger.log(`B"H maintenance gc: ${JSON.stringify(entry)}`);
		for (const alert of health.alerts) {
			if (typeof logger.error === 'function') logger.error(`B"H STORAGE ALERT ${alert.code}: ${alert.message}`);
			else if (typeof logger.log === 'function') logger.log(`B"H STORAGE ALERT ${alert.code}: ${alert.message}`);
		}
		return { ok: gc.ok && health.alerts.length === 0, gc, health };
	} finally {
		db._maintenanceGcRunning = false;
	}
}

/**
 * Defers one maintenance gc() out of the request path. Coalescing:
 * at most one run is pending or active per db; further schedules
 * while one is pending are dropped (the pending run covers them).
 * @param {object} db - Open AwtsmoosDB instance.
 * @param {object} [options={}] - { logger, delayMs, reason, ...thresholds }
 * @returns {boolean} True when a run was scheduled.
 */
function scheduleMaintenanceGc(db, options = {}) {
	if (!db || typeof db.gc !== 'function') return false;
	if (db._maintenanceGcRunning || db._maintenanceGcScheduled) return false;
	const delayMs = Number(options.delayMs ?? DEFAULT_SCHEDULE_DELAY_MS);
	db._maintenanceGcScheduled = true;
	setTimeout(() => {
		db._maintenanceGcScheduled = false;
		try {
			runMaintenanceGc(db, options);
		} catch (_error) {
			// Maintenance must never take the process down; the next
			// scheduled run retries. The error is logged, not swallowed.
			const logger = options.logger || console;
			if (typeof logger.error === 'function') logger.error(`B"H maintenance gc failed: ${_error && _error.message}`);
		}
	}, delayMs);
	if (typeof options.onScheduled === 'function') options.onScheduled(db, delayMs);
	return true;
}

module.exports = {
	checkStorageHealth,
	runMaintenanceGc,
	scheduleMaintenanceGc,
	DEFAULT_UNREACHABLE_ALERT_BYTES,
	DEFAULT_UNREACHABLE_ALERT_FRACTION,
	DEFAULT_SCHEDULE_DELAY_MS
};
