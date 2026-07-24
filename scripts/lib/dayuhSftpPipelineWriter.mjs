// B"H
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const WRITE_SIZE = 32 * 1024;
const MAX_IN_FLIGHT = 24;
const REPORT_INTERVAL = 256 * 1024 * 1024;

/**
 * Streams compressed tar output through explicit fixed-offset SFTP writes. Small
 * requests stay protocol-safe while a bounded acknowledgement window fills SSH.
 */
export async function writeTarThroughSftp({
	localRoot,
	sftp,
	remotePath,
	progress = () => {}
}) {
	const handle = await invoke(sftp, 'open', remotePath, 'w');
	const tar = spawn('tar', ['-czf', '-', '-C', localRoot, '.'], {
		env: { ...process.env, COPYFILE_DISABLE: '1' },
		stdio: ['ignore', 'pipe', 'pipe']
	});
	const errors = [];
	tar.stderr.on('data', chunk => errors.push(chunk));
	const hash = createHash('sha256');
	const inFlight = new Set();
	let position = 0;
	let acknowledged = 0;
	let nextReport = REPORT_INTERVAL;
	try {
		for await (const chunk of tar.stdout) {
			hash.update(chunk);
			for (let offset = 0; offset < chunk.length; offset += WRITE_SIZE) {
				const data = chunk.subarray(offset, Math.min(offset + WRITE_SIZE, chunk.length));
				const writePosition = position;
				position += data.length;
				const request = writeAt(sftp, handle, data, writePosition)
					.then(() => {
						acknowledged += data.length;
						if (acknowledged >= nextReport) {
							progress({ bytes: acknowledged });
							nextReport += REPORT_INTERVAL;
						}
					})
					.finally(() => inFlight.delete(request));
				inFlight.add(request);
				if (inFlight.size >= MAX_IN_FLIGHT) await Promise.race(inFlight);
			}
		}
		await Promise.all(inFlight);
		const code = await childExit(tar);
		if (code !== 0) throw new Error(Buffer.concat(errors).toString('utf8') || `tar_exit_${code}`);
		await invoke(sftp, 'close', handle);
		return { bytes: position, sha256: hash.digest('hex') };
	} catch (error) {
		tar.kill('SIGTERM');
		await Promise.allSettled(inFlight);
		try { await invoke(sftp, 'close', handle); } catch {}
		throw error;
	}
}

function writeAt(sftp, handle, data, position) {
	return invoke(sftp, 'write', handle, data, 0, data.length, position);
}

function invoke(target, method, ...args) {
	return new Promise((resolve, reject) => {
		target[method](...args, (error, value) => error ? reject(error) : resolve(value));
	});
}

function childExit(child) {
	return new Promise((resolve, reject) => {
		if (child.exitCode !== null) return resolve(child.exitCode);
		child.once('error', reject);
		child.once('close', resolve);
	});
}
