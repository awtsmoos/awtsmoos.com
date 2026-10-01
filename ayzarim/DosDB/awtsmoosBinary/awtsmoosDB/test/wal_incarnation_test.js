// B"H
'use strict';

const fs = require('fs');
const assert = require('assert');
const PagerFirmament = require('../core/pager/writablePager');
const { currentHeader } = require('../core/pager/walHeader');

const BASE = '/tmp/awtsmoos-wal-incarnation-test';
const LEGACY_MAGIC = Buffer.from('AWAL1');

/**
 * @file wal_incarnation_test.js
 * @description
 * A path may keep its name while the file beneath it is born anew. These four
 * witnesses prove that the AwtsmoosDB journal follows incarnation rather than
 * pathname: current replay, current rejection, legacy replay, legacy rejection.
 */
function cleanup() {
	for (const suffix of ['', '.wal', '.lock']) {
		try { fs.unlinkSync(`${BASE}${suffix}`); } catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
	}
}

function record(offset, bytes) {
	const header = Buffer.alloc(12);
	header.writeBigUInt64BE(BigInt(offset), 0);
	header.writeUInt32BE(bytes.length, 8);
	return Buffer.concat([header, bytes]);
}

function writeCurrentWal(bytes) {
	const fd = fs.openSync(BASE, 'r+');
	try {
		fs.writeFileSync(`${BASE}.wal`, Buffer.concat([currentHeader(fd), record(0, bytes)]));
	} finally {
		fs.closeSync(fd);
	}
}

function writeLegacyWal(bytes, stale = false) {
	fs.writeFileSync(`${BASE}.wal`, Buffer.concat([LEGACY_MAGIC, record(0, bytes)]));
	if (stale) fs.utimesSync(`${BASE}.wal`, new Date(0), new Date(0));
}

function reopenAndRead() {
	const pager = new PagerFirmament(BASE);
	pager.init();
	const bytes = pager.readExact(0, 5);
	pager.close();
	return bytes.toString('utf8');
}

function currentReplay() {
	cleanup();
	fs.writeFileSync(BASE, 'AAAAA');
	writeCurrentWal(Buffer.from('BBBBB'));
	assert.strictEqual(reopenAndRead(), 'BBBBB');
}

function currentRejectsRecreatedFile() {
	cleanup();
	fs.writeFileSync(BASE, 'OLD!!');
	writeCurrentWal(Buffer.from('STALE'));
	fs.unlinkSync(BASE);
	fs.writeFileSync(BASE, 'NEW!!');
	assert.strictEqual(reopenAndRead(), 'NEW!!');
	assert.strictEqual(fs.statSync(`${BASE}.wal`).size, 0);
}

function legacyReplay() {
	cleanup();
	fs.writeFileSync(BASE, '11111');
	writeLegacyWal(Buffer.from('22222'));
	assert.strictEqual(reopenAndRead(), '22222');
}

function legacyRejectsRecreatedFile() {
	cleanup();
	fs.writeFileSync(BASE, 'OLD!!');
	writeLegacyWal(Buffer.from('STALE'), true);
	fs.unlinkSync(BASE);
	fs.writeFileSync(BASE, 'NEW!!');
	assert.strictEqual(reopenAndRead(), 'NEW!!');
}

try {
	currentReplay();
	currentRejectsRecreatedFile();
	legacyReplay();
	legacyRejectsRecreatedFile();
	console.log('B"H wal_incarnation_test PASS');
} finally {
	cleanup();
}
