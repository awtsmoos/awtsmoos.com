// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpPageSession.mjs
 * @description Carries page-domain commands through Chrome's explicit target-message channel.
 * The Awtsmoos numbers the inner word and the outer vessel without letting either reply depart;
 * Awtsmoos.com keeps navigation, evaluation, input, and cleanup joined through one enduring heart.
 */
import { sendCdpCommand } from './BrowserCdpSocket.mjs';

let pageCommandSequence = 0;

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
			{ flatten: false, targetId: this.targetId }
		);
		this.sessionId = attached.sessionId;
		return this;
	}

	send(method, params = {}, timeoutMs = 10000) {
		const innerId = ++pageCommandSequence;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				cleanup();
				reject(new Error(`${method}_TIMEOUT`));
			}, timeoutMs);
			const listener = event => {
				const outer = JSON.parse(event.data);
				if (
					outer.method !== 'Target.receivedMessageFromTarget'
					|| outer.params?.sessionId !== this.sessionId
				) return;
				const inner = JSON.parse(outer.params.message);
				if (inner.id !== innerId) return;
				cleanup();
				inner.error
					? reject(new Error(JSON.stringify(inner.error)))
					: resolve(inner.result);
			};
			const cleanup = () => {
				clearTimeout(timer);
				this.browserSocket.removeEventListener('message', listener);
			};
			this.browserSocket.addEventListener('message', listener);
			const message = JSON.stringify({
				id: innerId,
				method,
				params
			});
			sendCdpCommand(
				this.browserSocket,
				'Target.sendMessageToTarget',
				{ message, sessionId: this.sessionId },
				timeoutMs
			).catch(error => {
				cleanup();
				reject(error);
			});
		});
	}

	async stop() {
		if (!this.sessionId) return;
		await sendCdpCommand(this.browserSocket, 'Target.detachFromTarget', {
			sessionId: this.sessionId
		}).catch(() => {});
		this.sessionId = null;
	}
}
