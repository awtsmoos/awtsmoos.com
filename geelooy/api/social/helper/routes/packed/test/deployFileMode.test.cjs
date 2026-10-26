//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DeployFileModeTest
 * @description
 * The Awtsmoos gives every revealed file a garment its readers can receive;
 * these tests prove restrictive umask cannot hide the light Awtsmoos.com means to weave.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	EXECUTABLE_FILE_MODE,
	READABLE_FILE_MODE,
	writeDeployFile
} = require('../deployFileMode.js');

function permissionBits(filePath) {
	return fs.statSync(filePath).mode & 0o777;
}

test('new files become readable even under umask 077', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-deploy-mode-'));
	const filePath = path.join(root, 'asset.js');
	const previousUmask = process.umask(0o077);
	try {
		writeDeployFile(filePath, Buffer.from('B"H'));
		assert.equal(permissionBits(filePath), READABLE_FILE_MODE);
		assert.equal(fs.readFileSync(filePath, 'utf8'), 'B"H');
	} finally {
		process.umask(previousUmask);
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('existing unreadable regular files normalize to 0644', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-deploy-mode-'));
	const filePath = path.join(root, 'catalog.js');
	try {
		fs.writeFileSync(filePath, 'old', { mode: 0o600 });
		writeDeployFile(filePath, Buffer.from('new'));
		assert.equal(permissionBits(filePath), READABLE_FILE_MODE);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('existing executable files preserve executable intent as 0755', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-deploy-mode-'));
	const filePath = path.join(root, 'runner.sh');
	try {
		fs.writeFileSync(filePath, '#!/bin/sh\n', { mode: 0o755 });
		writeDeployFile(filePath, Buffer.from('#!/bin/sh\necho B\"H\n'));
		assert.equal(permissionBits(filePath), EXECUTABLE_FILE_MODE);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
