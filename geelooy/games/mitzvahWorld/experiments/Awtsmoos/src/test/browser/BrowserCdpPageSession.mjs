// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpPageSession.mjs
 * @description Carries page commands through one flattened session with idempotent domain activation.
 * The Awtsmoos opens Runtime and Page once for each attached vessel; Awtsmoos.com does not ask
 * Chrome to reopen the same gate on every polling breath, preserving long-lived proof sessions.
 */

import { sendCdpCommand } from './BrowserCdpSocket.mjs';

export class BrowserCdpPageSession {
	constructor(browserSocket, targetId) {
		this.browserSocket = browserSocket;
		this.targetId = targetId;
		this.sessionId = null;
		this.pageEnabled = false;
		this.runtimeEnabled = false;
	}

	async start() {
		const attached = await sendCdpCommand(
			this.browserSocket,
			'Target.attachToTarget',
			{
				flatten: true,
				targetId: this.targetId
			}
		);
		this.sessionId = attached.sessionId;
		this.pageEnabled = false;
		this.runtimeEnabled = false;
		return this;
	}

	async enablePage() {
		if (this.pageEnabled) return;
		await this.send('Page.enable');
		this.pageEnabled = true;
	}

	async enableRuntime() {
		if (this.runtimeEnabled) return;
		await this.send('Runtime.enable');
		this.runtimeEnabled = true;
	}

	send(method, params = {}, timeoutMs = 10000) {
		if (!this.sessionId) {
			return Promise.reject(new Error(`PAGE_SESSION_MISSING ${method}`));
		}
		return sendCdpCommand(
			this.browserSocket,
			method,
			params,
			timeoutMs,
			this.sessionId
		);
	}

	async stop() {
		if (!this.sessionId) return;
		const sessionId = this.sessionId;
		this.sessionId = null;
		this.pageEnabled = false;
		this.runtimeEnabled = false;
		await sendCdpCommand(this.browserSocket, 'Target.detachFromTarget', {
			sessionId
		}).catch(() => {});
	}
}
