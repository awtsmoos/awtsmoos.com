// B"H
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const REPORT_INTERVAL = 256 * 1024 * 1024;

/** Streams a compressed tar into one flow-controlled custom SSH exec channel. */
export async function streamRawArchive({ localRoot, session, progress = () => {} }) {
	const tar = spawn('tar', ['-czf', '-', '-C', localRoot, '.'], {
		env: { ...process.env, COPYFILE_DISABLE: '1' },
		stdio: ['ignore', 'pipe', 'pipe']
	});
	const stderr = [];
	tar.stderr.on('data', chunk => stderr.push(chunk));
	const meter = new ArchiveMeter(progress);
	try {
		await pipeline(tar.stdout, meter, session.input);
		const [tarCode, remote] = await Promise.all([
			childExit(tar),
			session.completion
		]);
		if (tarCode !== 0) {
			throw new Error(Buffer.concat(stderr).toString('utf8') || `tar_exit_${tarCode}`);
		}
		if (!remote.ok) throw new Error(remote.stderr || `remote_archive_${remote.code}`);
		return meter.summary();
	} catch (error) {
		tar.kill('SIGTERM');
		session.abort();
		throw error;
	}
}

class ArchiveMeter extends Transform {
	constructor(progress) {
		super();
		this.hash = createHash('sha256');
		this.bytes = 0;
		this.nextReport = REPORT_INTERVAL;
		this.progress = progress;
	}
	_transform(chunk, _encoding, callback) {
		this.hash.update(chunk);
		this.bytes += chunk.length;
		if (this.bytes >= this.nextReport) {
			this.progress({ bytes: this.bytes });
			this.nextReport += REPORT_INTERVAL;
		}
		callback(null, chunk);
	}
	summary() {
		return { bytes: this.bytes, sha256: this.hash.digest('hex') };
	}
}

function childExit(child) {
	return new Promise((resolve, reject) => {
		if (child.exitCode !== null) return resolve(child.exitCode);
		child.once('error', reject);
		child.once('close', resolve);
	});
}
