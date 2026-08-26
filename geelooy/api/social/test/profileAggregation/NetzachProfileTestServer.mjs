//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NetzachProfileTestServer
 * @description
 * The Awtsmoos renews every server process before a port can pretend to own the test;
 * Awtsmoos.com lets Netzach claim an isolated port, route every request through that child, and release the vessel cleanly when verification may rest.
 */
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/** Finds an available loopback port and immediately releases the probe socket. */
export async function findFreePort() {
	return new Promise((resolve, reject) => {
		const probe = net.createServer();
		probe.once('error', reject);
		probe.listen(0, '127.0.0.1', () => {
			const address = probe.address();
			probe.close(error => {
				if (error) {
					reject(error);
					return;
				}
				resolve(address.port);
			});
		});
	});
}

export class NetzachProfileTestServer {
	/** @param {Object} options Repository root, test log directory, and isolated port. */
	constructor({ repoRoot, tmpDir, port }) {
		this.repoRoot = repoRoot;
		this.tmpDir = tmpDir;
		this.port = port;
		this.child = null;
	}

	/** Starts the owned Awtsmoos server and waits until the profile API responds. */
	async start() {
		fs.mkdirSync(this.tmpDir, { recursive: true });
		const stdout = fs.openSync(path.join(this.tmpDir, 'server.log'), 'w');
		const stderr = fs.openSync(path.join(this.tmpDir, 'server.err'), 'w');
		this.child = spawn('node', ['index'], {
			cwd: this.repoRoot,
			env: {
				...process.env,
				PORT: String(this.port)
			},
			stdio: ['ignore', stdout, stderr]
		});
		await this.waitUntilReady();
	}

	/** Polls only this child's isolated base URL until the API is available. */
	async waitUntilReady() {
		for (let attempt = 0; attempt < 60; attempt += 1) {
			if (this.child?.exitCode !== null) {
				throw new Error(`Profile test server exited early with ${this.child.exitCode}`);
			}
			try {
				const response = await this.request('/api/social/profile/templates');
				if (response.status === 200) {
					return;
				}
			} catch {
				// The owned child is still revealing its listening vessel.
			}
			await wait(250);
		}
		throw new Error(`Profile test server did not become ready on ${this.port}`);
	}

	/**
	 * Sends one request exclusively to the owned server.
	 * @param {string} route API route.
	 * @param {Object} options Method, body, and optional API key.
	 * @returns {Promise<{status:number,text:string,json:*}>} Parsed response record.
	 */
	async request(route, { method = 'GET', body, apiKey } = {}) {
		const keyedRoute = apiKey && method === 'GET'
			? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}`
			: route;
		const finalBody = apiKey && body ? { apiKey, ...body } : body;
		const response = await fetch(`http://127.0.0.1:${this.port}${keyedRoute}`, {
			method,
			headers: {
				...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
				...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
			},
			body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
			redirect: 'follow'
		});
		const text = await response.text();
		let json = null;
		try {
			json = text ? JSON.parse(text) : null;
		} catch {
			json = { raw: text };
		}
		return { status: response.status, text, json };
	}

	/** Stops only the child created by this harness. */
	async stop() {
		if (!this.child || this.child.exitCode !== null) {
			return;
		}
		this.child.kill('SIGTERM');
		await wait(250);
	}
}
