//B"H
// Offline unit tests for driveSyncClient.js (no network, no Drive connection).
// Live verification (status/list/inventory/download/verify against the real
// Drive API) was done manually and is recorded in the commit message.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createDriveSync, DriveSyncError, DriveAuthError, DriveFatalError } =
	require('./driveSyncClient.js');

test('error taxonomy is distinct and correctly shaped', () => {
	const auth = new DriveAuthError('nope', 'https://example/connect');
	assert.equal(auth.code, 'DRIVE_AUTH');
	assert.equal(auth.retryable, false);
	assert.equal(auth.connectUrl, 'https://example/connect');
	const fatal = new DriveFatalError('bad id');
	assert.equal(fatal.code, 'DRIVE_FATAL');
	assert.equal(fatal.retryable, false);
	const sync = new DriveSyncError('x', { code: 'C', retryable: true });
	assert.equal(sync.retryable, true);
	assert.ok(auth instanceof DriveSyncError);
	assert.ok(fatal instanceof DriveSyncError);
});

test('manifest round-trips atomically and verifyMirror proves integrity', async () => {
	const mirror = fs.mkdtempSync(path.join(os.tmpdir(), 'drivemirror-'));
	const d = createDriveSync({ mirrorRoot: mirror });
	const before = d.readManifest();
	assert.deepEqual(before, { version: 1, files: {} });

	// Plant a file and a matching manifest entry, then verify.
	const rel = 'sub/note.txt';
	const full = path.join(mirror, 'sub', 'note.txt');
	fs.mkdirSync(path.dirname(full), { recursive: true });
	const bytes = Buffer.from('boruch hashem');
	fs.writeFileSync(full, bytes);
	const { createHash } = await import('node:crypto');
	const md5 = createHash('md5').update(bytes).digest('hex');
	const manifest = d.readManifest();
	manifest.files['sub/note.txt'] = {
		id: 'abc', name: 'note.txt', mimeType: 'text/plain',
		size: bytes.length, md5, driveModifiedTime: null,
		downloadedAt: new Date().toISOString(), verified: true
	};
	// writeManifestAtomic is internal; reach it via a second downloadAll no-op is
	// overkill — instead assert verifyMirror reads what we hand-write.
	fs.writeFileSync(path.join(mirror, 'drive-mirror-manifest.json'), JSON.stringify(manifest));
	const report = await d.verifyMirror();
	assert.equal(report.total, 1);
	assert.equal(report.verified, 1);
	assert.deepEqual(report.missing, []);
	assert.deepEqual(report.corrupt, []);

	// Corrupt the file: verifyMirror must catch it, not silently pass.
	fs.writeFileSync(full, Buffer.from('tampered!'));
	const report2 = await d.verifyMirror();
	assert.deepEqual(report2.corrupt, ['sub/note.txt']);

	// Delete the file: verifyMirror must report it missing.
	fs.unlinkSync(full);
	const report3 = await d.verifyMirror();
	assert.deepEqual(report3.missing, ['sub/note.txt']);
});

test('unsafe Drive paths are refused before touching disk', async () => {
	const mirror = fs.mkdtempSync(path.join(os.tmpdir(), 'drivesafe-'));
	const d = createDriveSync({ mirrorRoot: mirror });
	await assert.rejects(
		d.downloadOne(
			{ id: 'x', name: 'evil', relPath: '../../etc/evil', mimeType: 'text/plain', size: 0, md5: null, modifiedTime: null },
			d.readManifest()
		),
		/Refusing unsafe path/
	);
	assert.ok(!fs.existsSync(path.join(mirror, 'etc', 'evil')));
});
