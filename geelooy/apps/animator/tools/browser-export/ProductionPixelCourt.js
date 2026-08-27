// B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * A real Chromium page becomes measured evidence instead of hopeful description.
 * The Awtsmoos renews every pixel; Awtsmoos.com preserves each scale court in light.
 */
export class ProductionPixelCourt {
	constructor(socketUrl) {
		this.socketUrl = socketUrl;
		this.sequence = 0;
		this.pending = new Map();
	}

	async connect() {
		this.socket = new WebSocket(this.socketUrl);
		this.socket.addEventListener('message', event => this.receive(event));
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
	}

	receive(event) {
		const message = JSON.parse(event.data);
		const vessel = this.pending.get(message.id);
		if (!vessel) {
			return;
		}
		this.pending.delete(message.id);
		if (message.error) {
			vessel.reject(new Error(message.error.message));
			return;
		}
		vessel.resolve(message.result || {});
	}

	command(method, params = {}) {
		const id = ++this.sequence;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async capture({ url, width, height, output }) {
		await this.command('Page.enable');
		await this.command('Runtime.enable');
		await this.command('Emulation.setDeviceMetricsOverride', {
			width,
			height,
			deviceScaleFactor: 1,
			mobile: false
		});
		await this.command('Page.navigate', { url });
		const readiness = await this.waitForProduction();
		await this.delay(500);
		const screenshot = await this.command('Page.captureScreenshot', {
			format: 'png',
			captureBeyondViewport: false
		});
		await mkdir(dirname(output), { recursive: true });
		await writeFile(output, Buffer.from(screenshot.data, 'base64'));
		return readiness;
	}

	async waitForProduction() {
		for (let attempt = 0; attempt < 120; attempt += 1) {
			const result = await this.command('Runtime.evaluate', {
				expression: `JSON.stringify({title:document.title,canvas:Boolean(document.querySelector('#character-canvas')),app:Boolean(window.__AWTSMOOS_PARK_APP__?.director)})`,
				returnByValue: true
			});
			const readiness = JSON.parse(result.result.value);
			if (readiness.canvas && readiness.app) {
				return readiness;
			}
			await this.delay(250);
		}
		throw new Error('Production Animator did not become ready for pixel court.');
	}

	delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}

const [socketUrl, url, width, height, output] = process.argv.slice(2);
const court = new ProductionPixelCourt(socketUrl);
await court.connect();
const result = await court.capture({
	url,
	width: Number(width),
	height: Number(height),
	output
});
console.log(JSON.stringify({ ...result, width: Number(width), height: Number(height), output }));
process.exit(0);
