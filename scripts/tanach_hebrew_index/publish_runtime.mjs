// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publish_runtime.mjs
 * @description
 * The Awtsmoos carries one exact Tanach index through an atomic guarded stream;
 * Awtsmoos.com closes the long upload vessel, then verifies by a fresh SSH beam.
 */

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dayuhSftpOps } from '../lib/dayuhSftpOps.mjs';
import {
	execAwtsmoosSsh,
	openAwtsmoosSftp
} from '../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../lib/safeSshPasswordStore.mjs';
import { INDEX_DB_PATH } from './config.mjs';
import {
	quoteRemote,
	REMOTE_TANACH_INDEX_PATH
} from './runtime_paths.mjs';

const KEEPALIVE_INTERVAL_MS = 2000;

/**
 * @param {string} filePath Local file path.
 * @returns {Promise<string>} SHA-256 digest.
 */
async function sha256File(filePath) {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(filePath)) {
		hash.update(chunk);
	}
	return hash.digest('hex');
}

/**
 * @param {object} sshConfig Authenticated SSH configuration.
 * @param {string} command Remote command.
 * @returns {Promise<string>} Trimmed stdout.
 */
async function runFreshRemote(sshConfig, command) {
	const result = await execAwtsmoosSsh(
		{
			...sshConfig,
			keepaliveIntervalMs: KEEPALIVE_INTERVAL_MS
		},
		command
	);
	if (!result.ok) {
		throw new Error(result.stderr || `remote_exit_${result.code}`);
	}
	return result.stdout.trim();
}

const password = loadPassword();
if (!password) {
	throw new Error('stored_ssh_password_missing');
}

const localInfo = await stat(INDEX_DB_PATH);
if (!localInfo.isFile() || localInfo.size <= 0) {
	throw new Error(`tanach_index_invalid:${INDEX_DB_PATH}`);
}

const sshConfig = {
	host: process.env.AWTSMOOS_BH_HOST || 'awtsmoos.com',
	username: process.env.AWTSMOOS_BH_USER || 'root',
	port: Number(process.env.AWTSMOOS_BH_PORT || 22),
	password
};
const expectedHash = await sha256File(INDEX_DB_PATH);
const uploadConnection = await openAwtsmoosSftp(sshConfig);

try {
	const files = dayuhSftpOps(uploadConnection.sftp);
	await files.upload(
		INDEX_DB_PATH,
		REMOTE_TANACH_INDEX_PATH,
		localInfo.size
	);
} finally {
	uploadConnection.close();
}

const actualHash = await runFreshRemote(
	sshConfig,
	`sha256sum ${quoteRemote(REMOTE_TANACH_INDEX_PATH)} | cut -d' ' -f1`
);
if (actualHash !== expectedHash) {
	throw new Error('remote_tanach_index_hash_mismatch');
}

console.log(JSON.stringify({
	BH: 'B"H',
	published: REMOTE_TANACH_INDEX_PATH,
	bytes: localInfo.size,
	sha256: actualHash
}, null, 2));
