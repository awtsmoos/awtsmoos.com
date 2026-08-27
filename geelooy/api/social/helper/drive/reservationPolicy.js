//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveReservationPolicy
 * @description
 * The Awtsmoos binds intention before bytes become commitment. Awtsmoos.com
 * reserves path, storage, and file-count headroom so concurrent uploads cannot
 * both pass quota gates or overwrite the same logical vessel invisibly.
 */

const crypto = require('crypto');
const { mergedQuota, assertSingleFile, quotaError } = require('./quotaPolicy.js');

const RESERVATION_LIFETIME_MS = 15 * 60 * 1000;

function createWriteReservation(state, logicalPath, bytes) {
	removeExpiredReservations(state);
	assertSingleFile(state, bytes);
	if (Object.values(state.reservations).some(item => item.path === logicalPath)) {
		throw quotaError('TRANSFER_CONFLICT');
	}
	const existing = state.entries[logicalPath];
	if (existing?.type === 'folder') throw quotaError('PATH_IS_FOLDER');
	const oldBytes = existing?.type === 'file' ? Number(existing.size || 0) : 0;
	const byteDelta = bytes - oldBytes;
	const fileDelta = existing?.type === 'file' ? 0 : 1;
	const reserved = reservedTotals(state);
	const quota = mergedQuota(state.quota);
	if (state.usage.storedBytes + reserved.bytes + Math.max(0, byteDelta) > quota.storageBytes) {
		throw quotaError('STORAGE_QUOTA_EXCEEDED');
	}
	if (state.usage.fileCount + reserved.files + Math.max(0, fileDelta) > quota.fileCount) {
		throw quotaError('FILE_COUNT_QUOTA_EXCEEDED');
	}
	const id = crypto.randomUUID();
	state.reservations[id] = {
		id,
		path: logicalPath,
		bytes,
		byteDelta,
		fileDelta,
		expectedHash: existing?.objectHash || null,
		expiresAt: Date.now() + RESERVATION_LIFETIME_MS
	};
	return state.reservations[id];
}

function consumeWriteReservation(state, reservationId) {
	removeExpiredReservations(state);
	const reservation = state.reservations[reservationId];
	if (!reservation) throw quotaError('RESERVATION_MISSING');
	const existingHash = state.entries[reservation.path]?.objectHash || null;
	if (existingHash !== reservation.expectedHash) throw quotaError('TRANSFER_CONFLICT');
	delete state.reservations[reservationId];
	return reservation;
}

function releaseReservation(state, reservationId) {
	delete state.reservations[reservationId];
}

function removeExpiredReservations(state) {
	const now = Date.now();
	for (const [id, reservation] of Object.entries(state.reservations || {})) {
		if (Number(reservation.expiresAt || 0) <= now) delete state.reservations[id];
	}
}

function reservedTotals(state) {
	return Object.values(state.reservations || {}).reduce((totals, item) => {
		totals.bytes += Math.max(0, Number(item.byteDelta || 0));
		totals.files += Math.max(0, Number(item.fileDelta || 0));
		return totals;
	}, { bytes: 0, files: 0 });
}

module.exports = {
	createWriteReservation,
	consumeWriteReservation,
	releaseReservation,
	removeExpiredReservations,
	reservedTotals
};
