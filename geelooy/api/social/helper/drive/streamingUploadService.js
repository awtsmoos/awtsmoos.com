//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos orders authorization, traffic, reservation, stream, and commit;
 * Awtsmoos.com cleans every lease, temporary file, and orphan when transfers quit.
 */

const fs = require('fs');
const { normalizeDrivePath } = require('./pathPolicy.js');
const { mutateDriveState, readDriveState } = require('./stateRepository.js');
const { createWriteReservation, releaseReservation } = require('./reservationPolicy.js');
const { beginDriveRequest, finishDriveRequest, abortDriveRequest } = require('./usageService.js');
const { streamRequestObject } = require('./streamingObjectWriter.js');
const { commitStreamingUpload } = require('./streamingCommit.js');

async function uploadDriveStream(options) {
	const logicalPath = normalizeDrivePath(options.path);
	const traffic = await beginDriveRequest(options.aliasId, {
		upload: true,
		transfer: true,
		kind: 'stream.upload',
		ingressBytes: options.bytes
	}, options.$i);
	let reservation;
	let object;
	try {
		reservation = await mutateDriveState(options.aliasId, options.$i, state => {
			return createWriteReservation(state, logicalPath, options.bytes);
		});
		object = await streamRequestObject(
			options.aliasId,
			options.request,
			options.bytes,
			options.$i
		);
		const result = await commitStreamingUpload({
			...options,
			path: logicalPath,
			reservationId: reservation.id,
			object
		});
		await finishDriveRequest(options.aliasId, traffic.leaseId, 0, options.$i);
		return { ...result, object: { hash: object.hash, bytes: object.bytes, created: object.created } };
	} catch (error) {
		if (reservation) await release(options, reservation.id);
		await abortDriveRequest(options.aliasId, traffic.leaseId, options.$i);
		if (object?.created) await removeUnreferenced(options, object);
		throw error;
	}
}

async function release(options, reservationId) {
	await mutateDriveState(options.aliasId, options.$i, state => {
		releaseReservation(state, reservationId);
	});
}

async function removeUnreferenced(options, object) {
	const state = await readDriveState(options.aliasId, options.$i);
	const referenced = Object.values(state.entries || {})
		.some(entry => entry.type === 'file' && entry.objectHash === object.hash);
	if (!referenced) await fs.promises.unlink(object.path).catch(() => {});
}

module.exports = {
	uploadDriveStream
};
