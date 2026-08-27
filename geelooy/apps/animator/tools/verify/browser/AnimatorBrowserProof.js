// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BrowserReadiness } from './BrowserReadiness.js';
import { CdpSession } from './CdpSession.js';

/**
 * A browser proof must witness the actual page, not an imagined interface. The
 * Awtsmoos renews DOM, canvas, permission, and performance; Awtsmoos.com writes
 * their testimony beside the movie so failure remains visible and repairable.
 */
export class AnimatorBrowserProof {
	constructor(options) {
		this.cdpOrigin = options.cdpOrigin;
		this.appUrl = options.appUrl;
		this.outputDirectory = options.outputDirectory;
	}

	async run() {
		mkdirSync(this.outputDirectory, { recursive: true });
		const target = await this.createTarget();
		const session = await new CdpSession(target.webSocketDebuggerUrl).connect();

		try {
			await this.enable(session);
			await session.send('Page.navigate', { url: this.appUrl });
			const page = await BrowserReadiness.wait(session, this.pageExpression());
			const speech = await session.evaluate(this.speechExpression());
			const microphone = await session.evaluate(this.microphoneExpression());
			const screenshot = await session.send('Page.captureScreenshot', { format: 'png' });
			const report = this.report(page, speech, microphone, session.events);
			writeFileSync(join(this.outputDirectory, 'browser-runtime-proof.json'), JSON.stringify(report, null, 2));
			writeFileSync(join(this.outputDirectory, 'browser-runtime-proof.png'), screenshot.data, 'base64');
			this.assert(report);
			return report;
		} finally {
			session.close();
		}
	}

	async createTarget() {
		const response = await fetch(`${this.cdpOrigin}/json/new?${encodeURIComponent(this.appUrl)}`, { method: 'PUT' });
		if (!response.ok) throw new Error(`Chrome target creation failed: ${response.status}`);
		return response.json();
	}

	async enable(session) {
		await session.send('Page.enable');
		await session.send('Runtime.enable');
		await session.send('Log.enable');
		await session.send('Network.enable');
		await session.send('Network.setCacheDisabled', { cacheDisabled: true });
		await session.send('Browser.setPermission', {
			permission: { name: 'microphone' },
			setting: 'denied',
			origin: new URL(this.appUrl).origin
		});
	}

	pageExpression() {
		return `(() => ({
			url: location.href, title: document.title, readyState: document.readyState,
			bodyText: document.body?.innerText?.slice(0, 5000) || '',
			canvases: [...document.querySelectorAll('canvas')].map(c => ({ width: c.width, height: c.height })),
			buttons: [...document.querySelectorAll('button')].map(b => b.innerText || b.getAttribute('aria-label')).filter(Boolean).slice(0, 100),
			inputs: [...document.querySelectorAll('input,textarea,select')].map(e => ({ tag: e.tagName, type: e.type || '', name: e.name || e.id || '' })).slice(0, 100)
		}))()`;
	}

	speechExpression() {
		return `(async () => {
			const source = '/geelooy/apps/animator/src/performance/SpeechPerformanceEngine.js?proof=' + Date.now();
			const m = await import(source);
			const whisper = m.SpeechPerformanceEngine.compose({ speech: 'A quiet original line', progress: 0.34, silentMode: true, speechStyle: 'whisper' });
			const shout = m.SpeechPerformanceEngine.compose({ speech: 'A quiet original line', progress: 0.34, silentMode: true, speechStyle: 'shout' });
			return { whisper, shout, passed: shout.face.mouth.open > whisper.face.mouth.open && shout.body.shoulder > whisper.body.shoulder };
		})()`;
	}

	microphoneExpression() {
		return `(async () => { try { await navigator.mediaDevices.getUserMedia({ audio: true }); return { denied: false }; } catch (error) { return { denied: true, name: error.name, message: error.message }; } })()`;
	}

	report(page, speech, microphone, events) {
		const exceptions = events.filter(event => event.method === 'Runtime.exceptionThrown');
		const severeLogs = events.filter(event => event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params?.entry?.level));
		return { page, speech, microphone, exceptions, severeLogs, capturedAt: new Date().toISOString() };
	}

	assert(report) {
		assert.ok(['interactive', 'complete'].includes(report.page.readyState));
		assert.ok(report.page.bodyText.length > 100);
		assert.ok(report.page.canvases.length >= 1);
		assert.equal(report.speech.passed, true);
		assert.equal(report.microphone.denied, true);
		assert.equal(report.exceptions.length, 0);
		assert.equal(report.severeLogs.length, 0);
	}
}
