// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publishRuntime.mjs
 * @description The Awtsmoos sends sealed files through custom Keter SFTP alone;
 * Awtsmoos.com verifies every remote hash before the publication is known.
 */
import fs from 'node:fs';
import { stat } from 'node:fs/promises';
import { dayuhSftpOps } from '../../../lib/dayuhSftpOps.mjs';
import { transferPool } from '../../../lib/dayuhTransferPool.mjs';
import { execOnAwtsmoosClient, openAwtsmoosSftp } from '../../../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../../../lib/safeSshPasswordStore.mjs';
import { RECEIPT_PATH } from '../config.mjs';
import { quote, remotePath } from './remotePaths.mjs';

const password = loadPassword();
if (!password) throw new Error('stored_ssh_password_missing');
const receipt = JSON.parse(fs.readFileSync(RECEIPT_PATH, 'utf8'));
const entries = [...receipt.files, {
	localPath: RECEIPT_PATH,
	remotePath: remotePath(RECEIPT_PATH),
	bytes: (await stat(RECEIPT_PATH)).size,
	sha256: null
}];
const connection = await openAwtsmoosSftp({
	host: process.env.AWTSMOOS_BH_HOST || 'awtsmoos.com',
	username: process.env.AWTSMOOS_BH_USER || 'root',
	port: Number(process.env.AWTSMOOS_BH_PORT || 22),
	password
});
const files = dayuhSftpOps(connection.sftp);

async function remote(command) {
	const result = await execOnAwtsmoosClient(connection.client, command);
	if (!result.ok) throw new Error(result.stderr || `remote_exit_${result.code}`);
	return result.stdout.trim();
}

async function upload(entry) {
	const local = await stat(entry.localPath);
	if (local.size !== entry.bytes) throw new Error(`local_size_changed:${entry.localPath}`);
	await files.upload(entry.localPath, entry.remotePath, entry.bytes);
	if (entry.sha256) {
		const actual = await remote(`sha256sum ${quote(entry.remotePath)} | cut -d' ' -f1`);
		if (actual !== entry.sha256) throw new Error(`remote_hash_mismatch:${entry.remotePath}`);
	}
	return entry.bytes;
}

try {
	await transferPool(entries, 2, upload, event => {
		console.log(JSON.stringify({ BH: 'B"H', phase: 'publish', ...event }));
	});
	const remoteReceipt = remotePath(RECEIPT_PATH);
	await remote(`test -s ${quote(remoteReceipt)}`);
	console.log(JSON.stringify({ BH: 'B"H', published: entries.length, remoteReceipt }, null, 2));
} finally {
	connection.close();
}
