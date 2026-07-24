// B"H
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pipeline } from 'node:stream/promises';

/** Native custom-SFTP operations with cached directories and atomic file swaps. */
export function dayuhSftpOps(sftp) {
	const directories = new Set(['/']);
	return {
		async ensureDirectory(path) {
			const segments = String(path).split('/').filter(Boolean);
			let current = '';
			for (const segment of segments) {
				current += `/${segment}`;
				if (directories.has(current)) continue;
				await ensureOne(sftp, current);
				directories.add(current);
			}
		},
		async upload(local, remote, expectedSize) {
			const temporary = `${remote}.part-${process.pid}`;
			await this.ensureDirectory(dirname(remote));
			await pipeline(createReadStream(local), sftp.createWriteStream(temporary));
			const info = await invoke(sftp, 'stat', temporary);
			if (Number(info?.size) !== Number(expectedSize)) throw new Error(`remote_size_mismatch: ${remote}`);
			await atomicRename(sftp, temporary, remote);
		},
		async download(remote, local, mtimeMs) {
			const temporary = `${local}.part-${process.pid}`;
			await mkdir(dirname(local), { recursive: true });
			await pipeline(sftp.createReadStream(remote), createWriteStream(temporary, { mode: 0o600 }));
			await rename(temporary, local);
			await import('node:fs/promises').then(fs => fs.utimes(local, new Date(), new Date(mtimeMs)));
		},
		async remove(path) {
			try { await invoke(sftp, 'unlink', path); }
			catch (error) { if (!notFound(error)) throw error; }
		},
		async readText(path) {
			const chunks = [];
			for await (const chunk of sftp.createReadStream(path)) chunks.push(chunk);
			return Buffer.concat(chunks).toString('utf8');
		}
	};
}

async function ensureOne(sftp, path) {
	try {
		await invoke(sftp, 'mkdir', path);
	} catch (error) {
		try { await invoke(sftp, 'stat', path); }
		catch { throw error; }
	}
}

async function atomicRename(sftp, temporary, target) {
	try {
		await invoke(sftp, 'posixRename', temporary, target);
	} catch (error) {
		if (typeof sftp.rename !== 'function') throw error;
		await invoke(sftp, 'rename', temporary, target);
	}
}

function invoke(sftp, method, ...args) {
	return new Promise((resolve, reject) => {
		sftp[method](...args, (error, value) => error ? reject(error) : resolve(value));
	});
}

function notFound(error) {
	return Number(error?.code) === 2 || /no such/i.test(error?.message || '');
}
