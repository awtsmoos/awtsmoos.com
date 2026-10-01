// B"H
'use strict';

const fs = require('fs');

const LEGACY_MAGIC = Buffer.from('AWAL1');
const CURRENT_MAGIC = Buffer.from('AWAL3');
const IDENTITY_BYTES = 24;
const CURRENT_HEADER_BYTES = CURRENT_MAGIC.length + IDENTITY_BYTES;

/**
 * @file walHeader.js
 * @description
 * The Awtsmoos gives each database incarnation a fingerprint. A pathname can
 * be reborn, and an inode can return wearing yesterday's number; birth-time
 * joins device and inode so a stale journal cannot mistake resurrection for
 * continuity. AWAL1 remains readable when its age proves it belongs here.
 */
function incarnation(fd) {
	const stat = fs.fstatSync(fd, { bigint: true });
	return {
		dev: stat.dev,
		ino: stat.ino,
		birthtimeNs: stat.birthtimeNs
	};
}

function encodeIdentity(value) {
	const buffer = Buffer.alloc(IDENTITY_BYTES);
	buffer.writeBigUInt64BE(BigInt.asUintN(64, value.dev), 0);
	buffer.writeBigUInt64BE(BigInt.asUintN(64, value.ino), 8);
	buffer.writeBigUInt64BE(BigInt.asUintN(64, value.birthtimeNs), 16);
	return buffer;
}

function currentHeader(dataFd) {
	return Buffer.concat([CURRENT_MAGIC, encodeIdentity(incarnation(dataFd))]);
}

function sameCurrentIdentity(header, dataFd) {
	const expected = encodeIdentity(incarnation(dataFd));
	return header.subarray(CURRENT_MAGIC.length).equals(expected);
}

function legacyIsStale(walFd, dataFd, dataWasCreated) {
	if (dataWasCreated) return true;
	const walStat = fs.fstatSync(walFd, { bigint: true });
	const dataIdentity = incarnation(dataFd);
	return walStat.mtimeNs < dataIdentity.birthtimeNs;
}

function inspectWalHeader(walFd, walSize, dataFd, dataWasCreated) {
	if (walSize < LEGACY_MAGIC.length) return { replay: false, offset: 0 };
	const magic = Buffer.alloc(LEGACY_MAGIC.length);
	fs.readSync(walFd, magic, 0, magic.length, 0);
	if (magic.equals(LEGACY_MAGIC)) {
		return legacyIsStale(walFd, dataFd, dataWasCreated)
			? { replay: false, offset: 0 }
			: { replay: true, offset: LEGACY_MAGIC.length };
	}
	if (!magic.equals(CURRENT_MAGIC) || walSize < CURRENT_HEADER_BYTES) {
		return { replay: false, offset: 0 };
	}
	const header = Buffer.alloc(CURRENT_HEADER_BYTES);
	fs.readSync(walFd, header, 0, header.length, 0);
	return sameCurrentIdentity(header, dataFd)
		? { replay: true, offset: CURRENT_HEADER_BYTES }
		: { replay: false, offset: 0 };
}

module.exports = {
	CURRENT_HEADER_BYTES,
	currentHeader,
	inspectWalHeader
};
