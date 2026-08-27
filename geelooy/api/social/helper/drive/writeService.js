//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveWriteService
 * @description
 * The Awtsmoos binds request, ingress, reservation, object, and quota in ordered
 * vessels. Awtsmoos.com releases failed transfer leases while retaining honest
 * request and received-byte accounting.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { mimeForPath } = require('./mimePolicy.js');
const { asBuffer, putObject } = require('./objectRepository.js');
const { mutateDriveState } = require('./stateRepository.js');
const { createWriteReservation, consumeWriteReservation, releaseReservation } = require('./reservationPolicy.js');
const { assertStorageDelta } = require('./quotaPolicy.js');
const { ensureParentFolders } = require('./entryHelpers.js');
const { recordDriveEvent } = require('./auditEvents.js');
const { beginDriveRequest, finishDriveRequest, abortDriveRequest } = require('./usageService.js');

async function writeDriveFile(options) {
	const logicalPath = normalizeDrivePath(options.path);
	const content = asBuffer(options.content);
	const traffic = await beginDriveRequest(options.aliasId, {
		upload: true,
		transfer: true,
		kind: 'upload',
		ingressBytes: content.length
	}, options.$i);
	let reservation;
	try {
		reservation = await mutateDriveState(options.aliasId, options.$i, state => {
			return createWriteReservation(state, logicalPath, content.length);
		});
		const object = await putObject(options.aliasId, content, options.$i);
		const result = await commitWrite(options, logicalPath, reservation.id, object);
		await finishDriveRequest(options.aliasId, traffic.leaseId, 0, options.$i);
		return result;
	} catch (error) {
		if (reservation) {
			await mutateDriveState(options.aliasId, options.$i, state => {
				releaseReservation(state, reservation.id);
			});
		}
		await abortDriveRequest(options.aliasId, traffic.leaseId, options.$i);
		throw error;
	}
}

async function commitWrite(options, logicalPath, reservationId, object) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const reservation = consumeWriteReservation(state, reservationId);
		const next = assertStorageDelta(state, reservation.byteDelta, reservation.fileDelta);
		const existing = state.entries[logicalPath];
		const now = new Date().toISOString();
		ensureParentFolders(state, logicalPath, now, options.aliasId);
		state.entries[logicalPath] = buildEntry(options, logicalPath, object, existing, now);
		state.usage.storedBytes = next.nextBytes;
		state.usage.fileCount = next.nextFiles;
		const event = recordDriveEvent(state, {
			type: existing ? 'file.overwrite' : 'file.create',
			actorUserId: options.actorUserId,
			credentialId: options.credentialId,
			path: logicalPath,
			bytes: object.bytes,
			requestId: options.requestId
		});
		return { entry: state.entries[logicalPath], usage: state.usage, event };
	});
}

function buildEntry(options, logicalPath, object, existing, now) {
	return {
		path: logicalPath,
		type: 'file',
		ownerAlias: options.aliasId,
		objectHash: object.hash,
		size: object.bytes,
		mime: mimeForPath(logicalPath, options.mime),
		visibility: options.visibility === 'public' ? 'public' : 'private',
		cachePolicy: options.cachePolicy === 'immutable' ? 'immutable' : 'mutable',
		createdAt: existing?.createdAt || now,
		updatedAt: now,
		trashedAt: null
	};
}

module.exports = {
	writeDriveFile
};
