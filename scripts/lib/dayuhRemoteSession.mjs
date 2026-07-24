// B"H
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { execOnAwtsmoosClient, openAwtsmoosSftp } from './awtsmoosSshClient.mjs';
import { dayuhSftpOps } from './dayuhSftpOps.mjs';

/** Owns one custom SSH/SFTP connection and exposes verified atomic transfers. */
export async function openDayuhRemote(config, password) {
	const connection = await openAwtsmoosSftp({
		host: config.host,
		username: config.username,
		port: config.port,
		password
	});
	const files = dayuhSftpOps(connection.sftp);
	const exec = async command => {
		const result = await execOnAwtsmoosClient(connection.client, command);
		if (!result.ok) throw new Error(result.stderr || `remote_exit_${result.code}`);
		return result;
	};
	return {
		...connection,
		exec,
		async initialize(helperFile) {
			await files.ensureDirectory(config.remoteState);
			await files.ensureDirectory(config.remoteRoot);
			const helperSize = (await stat(helperFile)).size;
			await files.upload(helperFile, `${config.remoteState}/manifest.mjs`, helperSize);
		},
		async lock(force = false) {
			if (force) await exec(`rm -rf ${quote(`${config.remoteState}/lock`)}`);
			await exec(`mkdir ${quote(`${config.remoteState}/lock`)}`);
		},
		async unlock() {
			await exec(`rm -rf ${quote(`${config.remoteState}/lock`)}`);
		},
		async scan() {
			await exec(`node ${quote(`${config.remoteState}/manifest.mjs`)} ${quote(config.remoteRoot)} ${quote(`${config.remoteState}/current.json`)}`);
			return JSON.parse(await files.readText(`${config.remoteState}/current.json`));
		},
		async upload(localRoot, path, entry) {
			await files.upload(join(localRoot, path), `${config.remoteRoot}/${path}`, entry.size);
			return entry.size;
		},
		async download(localRoot, path, entry) {
			await files.download(`${config.remoteRoot}/${path}`, join(localRoot, path), entry.mtimeMs);
			return entry.size;
		},
		async removeRemote(path) {
			await files.remove(`${config.remoteRoot}/${path}`);
		},
		async preserveConflict(localRoot, path) {
			const target = join(dirname(localRoot), '.dayuh-conflicts', String(Date.now()), path);
			await mkdir(dirname(target), { recursive: true });
			await pipeline(connection.sftp.createReadStream(`${config.remoteRoot}/${path}`), createWriteStream(target, { mode: 0o600 }));
			return target;
		}
	};
}

function quote(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
