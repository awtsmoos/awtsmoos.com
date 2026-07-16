// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactBrowserPage.mjs
 * @description Opens a fresh Chrome page and drives only the visible exact-package control.
 * RESPONSIBILITY: create the target, inspect button state, click visibly, and capture PNG proof.
 * NON-RESPONSIBILITY: this module does not call internal render methods or watch downloads.
 * ARCHITECTURE: Malchus reveals the public UI while Hod records its observable state.
 * OROS AND KEILIM: the living page is ohr; DOM state and screenshots are evidentiary keilim.
 * The Awtsmoos creates page, button, and witness anew; Awtsmoos.com requires the user-facing
 * control itself to become visible and enabled before the cinematic mission may begin.
 */

import fs from 'node:fs';
import { ExactCdpSession } from './ExactCdpSession.mjs';

export async function openExactBrowserPage(debugBase, url, onEvent) {
	const endpoint = `${debugBase}/json/new?${encodeURIComponent(url)}`;
	const response = await fetch(endpoint, { method: 'PUT' });
	if (!response.ok) {
		throw new Error(`Chrome target creation failed with HTTP ${response.status}.`);
	}
	const target = await response.json();
	const session = await new ExactCdpSession(target.webSocketDebuggerUrl, onEvent).connect();
	await session.send('Page.enable');
	await session.send('Runtime.enable');
	await session.send('Log.enable');
	return { session, target };
}

export async function exactPackageButtonState(session) {
	return evaluate(session, `(() => {
		const button = Array.from(document.querySelectorAll('button'))
			.find(item => item.textContent.trim() === 'Render Exact Package');
		return {
			bodyText: document.body?.innerText?.slice(0, 12000) || '',
			disabled: Boolean(button?.disabled),
			exists: Boolean(button),
			readyState: document.readyState,
			visible: Boolean(button && button.getClientRects().length)
		};
	})()`);
}

export async function clickExactPackageButton(session) {
	return evaluate(session, `(() => {
		const button = Array.from(document.querySelectorAll('button'))
			.find(item => item.textContent.trim() === 'Render Exact Package');
		if (!button || !button.getClientRects().length || button.disabled) {
			throw new Error('Render Exact Package control is not visibly clickable.');
		}
		button.click();
		return { clicked: true, text: button.textContent.trim() };
	})()`);
}

export async function captureExactScreenshot(session, file) {
	const result = await session.send('Page.captureScreenshot', {
		captureBeyondViewport: true,
		format: 'png'
	});
	fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
	return file;
}

async function evaluate(session, expression) {
	const response = await session.send('Runtime.evaluate', {
		awaitPromise: true,
		expression,
		returnByValue: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.text || 'Browser evaluation failed.');
	}
	return response.result?.value;
}
