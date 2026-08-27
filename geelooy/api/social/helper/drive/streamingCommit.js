//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins a completed object to logical metadata in one atomic state;
 * Awtsmoos.com consumes reservations and makes identical retries idempotent and straight.
 */

const { mimeForPath } = require('./mimePolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { consumeWriteReservation } = require('./reservationPolicy.js');
const { assertStorageDelta } = require('./quotaPolicy.js');
const { ensureParentFolders } = require('./entryHelpers.js');
const { recordDriveEvent } = require('./auditEvents.js');
const { uploadFingerprint, recordKey, policyError } = require('./streamingUploadPolicy.js');

async function commitStreamingUpload(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const reservation = consumeWriteReservation(state, options.reservationId);
		const fingerprint = uploadFingerprint({ ...options, ...options.object });
		const key = recordKey(options.idempotencyKey);
		const replay = replayResult(state, key, fingerprint, options.object.hash);
		if (replay) return replay;
		const next = assertStorageDelta(state, reservation.byteDelta, reservation.fileDelta);
		const existing = state.entries[options.path];
		const now = new Date().toISOString();
		ensureParentFolders(state, options.path, now, options.aliasId);
		state.entries[options.path] = buildEntry(options, existing, now);
		state.usage.storedBytes = next.nextBytes;
		state.usage.fileCount = next.nextFiles;
		state.idempotencyRecords[key] = {
			kind: 'stream.upload',
			fingerprint,
			path: options.path,
			objectHash: options.object.hash,
			createdAt: now
		};
		pruneStreamRecords(state);
		const event = recordDriveEvent(state, {
			type: existing ? 'file.overwrite' : 'file.create',
			actorUserId: options.actorUserId,
			credentialId: options.credentialId,
			path: options.path,
			bytes: options.object.bytes,
			requestId: options.requestId
		});
		return { entry: state.entries[options.path], usage: state.usage, event, replayed: false };
	});
}

function replayResult(state, key, fingerprint, objectHash) {
	const previous = state.idempotencyRecords[key];
	if (!previous) return null;
	if (previous.kind !== 'stream.upload' || previous.fingerprint !== fingerprint) {
		throw policyError('IDEMPOTENCY_CONFLICT', 409);
	}
	const entry = state.entries[previous.path];
	if (!entry || entry.objectHash !== objectHash) {
		throw policyError('IDEMPOTENCY_RECORD_STALE', 409);
	}
	return { entry, usage: state.usage, event: null, replayed: true };
}

function buildEntry(options, existing, now) {
	return {
		path: options.path,
		type: 'file',
		ownerAlias: options.aliasId,
		objectHash: options.object.hash,
		size: options.object.bytes,
		mime: mimeForPath(options.path, options.mime),
		visibility: options.visibility,
		cachePolicy: options.cachePolicy,
		createdAt: existing?.createdAt || now,
		updatedAt: now,
		trashedAt: null
	};
}

function pruneStreamRecords(state) {
	const records = Object.entries(state.idempotencyRecords)
		.filter(([, value]) => value.kind === 'stream.upload')
		.sort((left, right) => String(left[1].createdAt).localeCompare(String(right[1].createdAt)));
	for (const [key] of records.slice(0, Math.max(0, records.length - 500))) {
		delete state.idempotencyRecords[key];
	}
}

module.exports = {
	commitStreamingUpload
};
