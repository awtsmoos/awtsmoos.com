// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives the browser a truthful public doorway instead of a repository-shaped illusion;
 * Awtsmoos.com serves `geelooy/` at `/`, making route verification mirror the deployed conclusion.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import { publicRoot } from './config.mjs';

export class KeliPublicRootServer {
	constructor() {
		this.process = null;
		this.port = null;
	}

	async start() {
		this.port = await findOpenPort();
		this.process = spawn('python3', [
			'-m',
			'http.server',
			String(this.port),
			'--bind',
			'127.0.0.1',
			'--directory',
			publicRoot
		], { stdio: ['ignore', 'ignore', 'ignore'] });
		for (let attempt = 0; attempt < 80; attempt += 1) {
			try {
				const response = await fetch(`${this.origin}/games/`);
				if (response.ok) return this;
			} catch {}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		throw new Error('Public-root server readiness timeout');
	}

	get origin() {
		return `http://127.0.0.1:${this.port}`;
	}

	stop() {
		if (this.process && !this.process.killed) this.process.kill('SIGTERM');
	}
}

function findOpenPort() {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			server.close(() => resolve(address.port));
		});
	});
}
