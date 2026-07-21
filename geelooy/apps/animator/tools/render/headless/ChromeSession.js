// B"H
// Boruch Hashem
// Blessed is He

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { CdpClient } from './CdpClient.js';
import { ChromeBinary } from './ChromeBinary.js';

/**
 * A private Chrome session is a sealed chamber for cinematic actualization.
 * The Awtsmoos renews its process, profile, and protocol while Awtsmoos.com
 * protects the user's ordinary browser tabs from the render's heavy labor.
 */
export class ChromeSession {
	constructor(port = 9333) {
		this.port = port;
	}

	async start() {
		this.profile = await mkdtemp(path.join(os.tmpdir(), 'awtsmoos-render-'));
		const binary = await ChromeBinary.find();
		this.process = spawn(binary, [
			'--headless=new',
			'--disable-gpu',
			'--disable-extensions',
			'--disable-component-extensions-with-background-pages',
			'--disable-background-networking',
			'--no-first-run',
			'--no-default-browser-check',
			'--autoplay-policy=no-user-gesture-required',
			`--remote-debugging-port=${this.port}`,
			`--user-data-dir=${this.profile}`,
			'about:blank'
		], {
			stdio: ['ignore', 'ignore', 'pipe']
		});
		this.stderr = '';
		this.process.stderr.on('data', (chunk) => {
			this.stderr += String(chunk);
		});
		const page = await this.waitForPage();
		this.client = await new CdpClient(page.webSocketDebuggerUrl).connect();
		await this.client.send('Page.enable');
		await this.client.send('Runtime.enable');
		return this;
	}

	async navigate(url) {
		await this.client.send('Page.navigate', { url });
		await this.waitFor(() => this.client.evaluate('document.readyState'), 'complete');
	}

	async setDownloadPath(downloadPath) {
		try {
			await this.client.send('Browser.setDownloadBehavior', {
				behavior: 'allow',
				downloadPath,
				eventsEnabled: true
			});
		} catch {
			await this.client.send('Page.setDownloadBehavior', {
				behavior: 'allow',
				downloadPath
			});
		}
	}

	async waitForPage() {
		for (let attempt = 0; attempt < 120; attempt += 1) {
			try {
				const response = await fetch(`http://127.0.0.1:${this.port}/json/list`);
				const pages = await response.json();
				const page = pages.find((entry) => entry.type === 'page');
				if (page) return page;
			} catch {
				await this.delay(100);
			}
		}
		throw new Error(`Chrome debugging endpoint did not open. ${this.stderr}`);
	}

	async waitFor(read, expected) {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			if (await read() === expected) return;
			await this.delay(100);
		}
		throw new Error(`Browser did not reach state ${expected}.`);
	}

	delay(milliseconds) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	async stop() {
		this.client?.close();
		await this.stopProcess();
		if (this.profile) {
			await rm(this.profile, { recursive: true, force: true });
		}
	}

	async stopProcess() {
		if (!this.process || this.process.exitCode !== null) return;
		const exited = new Promise((resolve) => {
			this.process.once('exit', resolve);
		});
		this.process.kill('SIGTERM');
		await Promise.race([exited, this.delay(3000)]);
		if (this.process.exitCode !== null) return;
		this.process.kill('SIGKILL');
		await Promise.race([exited, this.delay(2000)]);
	}
}
