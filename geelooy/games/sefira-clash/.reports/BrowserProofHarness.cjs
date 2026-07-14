//B"H
//Boruch Hashem
//Blessed is He

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const WebSocket = require('ws');

const repoRoot = '/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com';
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitFor(label, probe, timeout = 20000) {
	const started = Date.now();
	let last = null;
	while (Date.now() - started < timeout) {
		try {
			last = await probe();
		} catch {}
		if (last) return last;
		await delay(80);
	}
	throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(last)}`);
}

class CdpPage {
	constructor(debuggerUrl, errors) {
		this.errors = errors;
		this.sequence = 0;
		this.pending = new Map();
		this.socket = new WebSocket(debuggerUrl);
		this.ready = new Promise((resolve, reject) => {
			this.socket.once('open', resolve);
			this.socket.once('error', reject);
		});
		this.socket.on('message', raw => this.receive(JSON.parse(raw.toString())));
	}

	receive(message) {
		if (message.id) {
			const pending = this.pending.get(message.id);
			if (!pending) return;
			this.pending.delete(message.id);
			if (message.error) pending.reject(new Error(message.error.message));
			else pending.resolve(message.result || {});
			return;
		}
		if (message.method === 'Runtime.exceptionThrown') {
			this.errors.push({
				type: 'exception',
				text: message.params.exceptionDetails.exception?.description
					|| message.params.exceptionDetails.text
			});
		}
		if (message.method === 'Runtime.consoleAPICalled') {
			const type = message.params.type;
			if (type === 'error' || type === 'warning') {
				this.errors.push({
					type,
					text: message.params.args.map(value => value.value || value.description || '').join(' ')
				});
			}
		}
	}

	async command(method, params = {}) {
		await this.ready;
		const id = ++this.sequence;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const response = await this.command('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (response.exceptionDetails) {
			throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
		}
		return response.result?.value;
	}

	close() {
		this.socket.close();
	}
}

class BrowserProofHarness {
	constructor(options) {
		this.port = options.port;
		this.reportPath = options.reportPath;
		this.baseUrl = `http://127.0.0.1:${this.port}/geelooy/games/sefira-clash`;
		this.report = {
			startedAt: new Date().toISOString(),
			ok: false,
			steps: [],
			browserErrors: []
		};
		this.server = null;
		this.target = null;
		this.page = null;
	}

	async start() {
		this.server = spawn('python3', ['-m', 'http.server', String(this.port), '--bind', '127.0.0.1'], {
			cwd: repoRoot,
			stdio: 'ignore'
		});
		await waitFor('static server', async () => {
			return (await fetch(`${this.baseUrl}/index.html`)).status === 200;
		});
		const response = await fetch('http://127.0.0.1:9222/json/new?about%3Ablank', { method: 'PUT' });
		if (!response.ok) throw new Error(`Chrome target failed: ${response.status}`);
		this.target = await response.json();
		this.page = new CdpPage(this.target.webSocketDebuggerUrl, this.report.browserErrors);
		await this.page.command('Runtime.enable');
		await this.page.command('Page.enable');
		await this.page.command('Page.addScriptToEvaluateOnNewDocument', { source: seedSource() });
		await this.page.command('Page.navigate', { url: `${this.baseUrl}/index.html` });
		await waitFor('main menu', () => this.page.evaluate(`Boolean(globalThis.__sefiraClashDebug)
			&& [...document.querySelectorAll('button')].some(button => button.textContent.includes('Open World'))`));
		this.record('browser-started', { port: this.port });
	}

	record(name, details = {}) {
		this.report.steps.push({ name, ok: true, ...details });
		this.flush();
	}

	flush() {
		fs.writeFileSync(this.reportPath, JSON.stringify(this.report, null, '\t'));
	}

	async clickButton(text, root = 'document') {
		const clicked = await this.page.evaluate(`(() => {
			const scope = ${root};
			const button = [...scope.querySelectorAll('button')]
				.find(item => item.textContent.includes(${JSON.stringify(text)}));
			if (!button) return false;
			button.click();
			return true;
		})()`);
		if (!clicked) throw new Error(`Button not found: ${text}`);
	}

	async press(code, key, milliseconds = 60) {
		await this.page.command('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
		await delay(milliseconds);
		await this.page.command('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
	}

	async hold(code, key, milliseconds) {
		await this.page.command('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
		await delay(milliseconds);
		await this.page.command('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
	}

	async moveToX(targetX, tolerance = 42) {
		for (let attempt = 0; attempt < 32; attempt += 1) {
			const x = await this.page.evaluate(`globalThis.__sefiraClashDebug.state().fighters.find(fighter => fighter.human).x`);
			const delta = targetX - x;
			if (Math.abs(delta) <= tolerance) return x;
			const right = delta > 0;
			await this.hold(
				right ? 'KeyD' : 'KeyA',
				right ? 'd' : 'a',
				Math.min(900, Math.max(100, Math.abs(delta) * 0.85))
			);
			await delay(50);
		}
		throw new Error(`Could not walk to x=${targetX}`);
	}

	async openWorld() {
		await this.clickButton('Open World');
		await waitFor('open world', () => this.page.evaluate(`globalThis.__sefiraClashDebug.state().mode === 'openworld'`));
	}

	async shape() {
		return this.page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.state();
			return {
				human: state.fighters.find(fighter => fighter.human),
				doors: state.openWorld.scenes.street.openWorld.doors,
				nodes: state.openWorld.scenes.street.openWorld.traversalNodes,
				citizens: state.openWorld.activeCitizens,
				prompt: state.openWorld.prompt,
				interiorId: state.openWorld.interiorId,
				combat: state.openWorld.combat
			};
		})()`);
	}

	async enterDoor(destination) {
		const door = (await this.shape()).doors.find(item => item.destination === destination);
		if (!door) throw new Error(`Door missing: ${destination}`);
		await this.moveToX(door.x + door.w / 2);
		await waitFor(`${destination} prompt`, async () => {
			const prompt = await this.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
			return prompt.includes(door.label) ? prompt : null;
		});
		await this.press('Enter', 'Enter');
		await waitFor(`${destination} interior`, () => this.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.interiorId === ${JSON.stringify(destination)}`));
	}

	async useService() {
		const targetX = await this.page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.state();
			const service = state.openWorld.scenes.interiors[state.openWorld.interiorId].openWorld.serviceNode;
			return service.x + service.w / 2;
		})()`);
		await this.moveToX(targetX);
		await waitFor('service prompt', async () => {
			const prompt = await this.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
			return prompt.includes('ENTER') ? prompt : null;
		});
		await this.press('Enter', 'Enter');
		await waitFor('service overlay', () => this.page.evaluate(`!document.getElementById('openWorldOverlay').classList.contains('hidden')`));
	}

	async closeOverlay() {
		await this.clickButton('Return to Room', 'document.getElementById("openWorldOverlay")');
		await waitFor('overlay closed', () => this.page.evaluate(`document.getElementById('openWorldOverlay').classList.contains('hidden')`));
	}

	async exitInterior() {
		const targetX = await this.page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.state();
			const door = state.openWorld.scenes.interiors[state.openWorld.interiorId].openWorld.doors[0];
			return door.x + door.w / 2;
		})()`);
		await this.moveToX(targetX);
		await waitFor('exit prompt', async () => {
			const prompt = await this.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
			return prompt.includes('Return to') ? prompt : null;
		});
		await this.press('Enter', 'Enter');
		await waitFor('street return', () => this.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.interiorId === null`));
	}

	async screenshot(path) {
		const image = await this.page.command('Page.captureScreenshot', { format: 'png' });
		fs.writeFileSync(path, Buffer.from(image.data, 'base64'));
	}

	async finish() {
		if (this.report.browserErrors.length) {
			throw new Error(`Browser errors: ${JSON.stringify(this.report.browserErrors)}`);
		}
		this.report.ok = true;
		this.report.finishedAt = new Date().toISOString();
		this.flush();
		await this.cleanup();
	}

	async fail(error) {
		this.report.ok = false;
		this.report.error = error.stack || String(error);
		this.report.finishedAt = new Date().toISOString();
		this.flush();
		await this.cleanup();
	}

	async cleanup() {
		this.page?.close();
		if (this.target?.id) {
			try {
				await fetch(`http://127.0.0.1:9222/json/close/${this.target.id}`);
			} catch {}
		}
		this.server?.kill('SIGTERM');
	}
}

function seedSource() {
	const profile = {
		version: 2,
		xp: 1200,
		perutas: 800,
		reputation: {
			malchus: 40,
			yesod: 12,
			hod: 12,
			netzach: 12,
			tiferes: 12,
			gevurah: 12,
			chesed: 12,
			binah: 12,
			chochmah: 12,
			keser: 12
		},
		discovered: ['malchus-citadel'],
		cleared: [],
		inventory: ['training-sword', 'woven-vest', 'travel-mantle', 'path-boots', 'spark-charm'],
		equipped: {
			weapon: 'training-sword',
			armor: 'woven-vest',
			mantle: 'travel-mantle',
			boots: 'path-boots',
			relic: 'spark-charm'
		},
		quests: {},
		materials: {},
		crafted: [],
		serviceClaims: [],
		weatherClock: 4,
		activeLocationId: 'malchus-citadel',
		sync: { profileId: '', revision: 0, syncedAt: 0 }
	};
	return `try {
		localStorage.clear();
		localStorage.setItem('sefiraClashProfile', JSON.stringify({ headwear: 'kippah', hue: 182, ready: true }));
		localStorage.setItem('sefiraClashExpeditionV1', JSON.stringify(${JSON.stringify(profile)}));
	} catch {}`;
}

module.exports = { BrowserProofHarness, delay, waitFor };
