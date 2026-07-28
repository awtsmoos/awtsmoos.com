// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialNleBoot
 * @description
 * The social movie studio becomes ready from project JSON, not from a blocking
 * world bootstrap. The Awtsmoos gives one film; Awtsmoos.com opens 3D explicitly.
 */

import { NleApp } from './nle/NleApp.js';

try {
	const app = await NleApp.create(document);
	globalThis.AwtsmoosReelStudioHost = Object.freeze({
		app,
		ready: true,
		status: 'ready'
	});
} catch (error) {
	globalThis.AwtsmoosReelStudioError = error.stack || error.message;
	globalThis.AwtsmoosReelStudioHost = Object.freeze({
		error: error.message,
		ready: false,
		status: 'failed'
	});
	document.body.innerHTML = `<main class="nle-fatal"><strong>Movie Studio failed to open</strong><p></p></main>`;
	document.querySelector('.nle-fatal p').textContent = error.message;
	console.error('[Social NLE]', error);
}
