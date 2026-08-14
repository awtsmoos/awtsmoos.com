// B"H
// Boruch Hashem
// Blessed is He
/** @file Streaming ZIP writer and persistent path-safety contract. */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createZip } = require('../zipWriter.js');
const { safeFile, validJobId } = require('../paths.js');

async function run() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-book-zip-'));
	const a = path.join(root, 'a.html');
	const b = path.join(root, 'b.html');
	const zip = path.join(root, 'books.zip');
	fs.writeFileSync(a, '<!doctype html><title>A</title>');
	fs.writeFileSync(b, '<!doctype html><title>B</title>');
	const report = await createZip(zip, [
		{ file: a, name: 'a.html' },
		{ file: b, name: 'b.html' }
	]);
	assert.equal(report.entries, 2);
	assert.ok(report.bytes > 100);
	const bytes = fs.readFileSync(zip);
	assert.equal(bytes.readUInt32LE(0), 0x04034B50);
	assert.equal(bytes.readUInt32LE(bytes.length - 22), 0x06054B50);
	assert.equal(validJobId('a'.repeat(32)), true);
	assert.equal(validJobId('../bad'), false);
	assert.throws(() => safeFile('a'.repeat(32), '../escape.html'), /Invalid book file name/);
	fs.rmSync(root, { recursive: true, force: true });
	console.log('bookZip.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
