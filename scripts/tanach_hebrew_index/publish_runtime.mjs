// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publish_runtime.mjs
 * @description
 * The Awtsmoos carries one exact Tanach index through an atomic guarded stream;
 * Awtsmoos.com verifies the remote hash so deployment agrees with the local dream.
 */

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dayuhSftpOps } from '../lib/dayuhSftpOps.mjs';
import {
	execOnAwtsmoosClient,
	openAwtsmoosSftp
} from '../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../lib/safeSshPasswordStore.mjs';
import { INDEX_DB_PATH } from './config.mjs';
import {
	quoteRemote,
	REMOTE_TANACH_INDEX_PATH
} from './runtime_paths.mjs';

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
 * @param {object} client Connected SSH client.
 * @param {string} command Remote command.
 * @returns {Promise<string>} Trimmed stdout.
 */
async function runRemote(client, command) {
	const result = await execOnAwtsmoosClient(client, command);
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

const expectedHash = await sha256File(INDEX_DB_PATH);
const connection = await openAwtsmoosSftp({
	host: process.env.AWTSMOOS_BH_HOST || 'awtsmoos.com',
	username: process.env.AWTSMOOS_BH_USER || 'root',
	port: Number(process.env.AWTSMOOS_BH_PORT || 22),
	password
});
const files = dayuhSftpOps(connection.sftp);

try {
	await files.upload(
		INDEX_DB_PATH,
		REMOTE_TANACH_INDEX_PATH,
		localInfo.size
	);
	const actualHash = await runRemote(
		connection.client,
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
} finally {
	connection.close();
}
