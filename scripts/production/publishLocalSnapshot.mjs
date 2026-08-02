// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publishLocalSnapshot.mjs
 * @description The Awtsmoos carries one hash-sealed source vessel through Keter;
 * Awtsmoos.com switches immutably only after remote size and hash agree together.
 */
import fs from 'node:fs';
import path from 'node:path';
import { dayuhSftpOps } from '../lib/dayuhSftpOps.mjs';
import {
	execOnAwtsmoosClient,
	openAwtsmoosSftp
} from '../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../lib/safeSshPasswordStore.mjs';

const receiptPath = process.argv[2];
if (!receiptPath) throw new Error('snapshot_receipt_required');
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const script = path.resolve('scripts/production/immutable-local-snapshot.sh');
const remoteRoot = '/mnt/HC_Volume_102267213/deployments';
const remoteArchive = `${remoteRoot}/${path.basename(receipt.archive)}`;
const remoteScript = `${remoteRoot}/immutable-local-snapshot.sh`;
const password = loadPassword();
if (!password) throw new Error('stored_ssh_password_missing');
const connection = await openAwtsmoosSftp({
	host: process.env.AWTSMOOS_BH_HOST || 'awtsmoos.com',
	username: process.env.AWTSMOOS_BH_USER || 'root',
	port: Number(process.env.AWTSMOOS_BH_PORT || 22),
	password
});
const files = dayuhSftpOps(connection.sftp);

function quote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

async function remote(command) {
	const result = await execOnAwtsmoosClient(connection.client, command);
	if (!result.ok) throw new Error(result.stderr || `remote_exit_${result.code}`);
	return result.stdout.trim();
}

try {
	await remote(`mkdir -p ${quote(remoteRoot)}`);
	await files.upload(receipt.archive, remoteArchive, receipt.bytes);
	await files.upload(script, remoteScript, fs.statSync(script).size);
	const actual = await remote(`sha256sum ${quote(remoteArchive)} | cut -d' ' -f1`);
	if (actual !== receipt.hash) throw new Error('remote_snapshot_hash_mismatch');
	await remote(`chmod 0755 ${quote(remoteScript)}`);
	const output = await remote(`bash ${quote(remoteScript)} ${quote(remoteArchive)} ${quote(receipt.hash)}`);
	const current = await remote('readlink -f /mnt/HC_Volume_102267213/releases/current');
	if (!current.endsWith(receipt.hash)) throw new Error(`release_switch_mismatch:${current}`);
	console.log(JSON.stringify({ BH: 'B"H', current, hash: receipt.hash, output }, null, 2));
} finally {
	connection.close();
}
