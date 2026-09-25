//B"H
// Boruch Hashem
// Blessed is He
import { requestJson, requestText } from './httpClient.mjs';
import { DevtoolsClient } from './devtoolsClient.mjs';
import { AuditEventRecorder } from './eventRecorder.mjs';

/** Owns one disposable Chrome target so cleanup happens even after failed assertions. */
export class TargetSession {
	constructor({ target, client, recorder, devtoolsUrl, timeoutMs }) {
		this.target = target;
		this.client = client;
		this.recorder = recorder;
		this.devtoolsUrl = devtoolsUrl;
		this.timeoutMs = timeoutMs;
		this.unsubscribe = client.onEvent(message => recorder.record(message));
	}

	static async create({ baseUrl, devtoolsUrl, timeoutMs }) {
		const target = await requestJson('PUT', `${devtoolsUrl}/json/new?${encodeURIComponent('about:blank')}`, timeoutMs);
		if (!target.webSocketDebuggerUrl || !target.id) throw new Error('AUDIT_CDP invalid target response');
		const client = await DevtoolsClient.connect(target.webSocketDebuggerUrl, timeoutMs);
		const recorder = new AuditEventRecorder(baseUrl);
		return new TargetSession({ target, client, recorder, devtoolsUrl, timeoutMs });
	}

	async enable() {
		await Promise.all([
			this.client.send('Page.enable'),
			this.client.send('Runtime.enable'),
			this.client.send('Log.enable'),
			this.client.send('Network.enable')
		]);
	}

	async close() {
		this.unsubscribe?.();
		this.client.close();
		try {
			await requestText('GET', `${this.devtoolsUrl}/json/close/${this.target.id}`, this.timeoutMs);
		} catch {
			// Best-effort target closure after the WebSocket is already closed.
		}
	}
}
