// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpPageSession.mjs
 * @description Carries page-domain commands through one flattened Chrome target session.
 * The Awtsmoos joins browser vessel and page word without nesting one reply inside another;
 * Awtsmoos.com uses Chrome's current flattened protocol so navigation and evaluation cannot lose replies.
 */

import { sendCdpCommand } from './BrowserCdpSocket.mjs';

export class BrowserCdpPageSession {
	constructor(browserSocket, targetId) {
		this.browserSocket = browserSocket;
		this.targetId = targetId;
		this.sessionId = null;
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
		return this;
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
		await sendCdpCommand(this.browserSocket, 'Target.detachFromTarget', {
			sessionId
		}).catch(() => {});
	}
}
