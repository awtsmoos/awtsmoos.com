//B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Boots the raw-WebGL battlefield first, then invites optional account cosmetics
 * through a dynamic import that cannot become a gameplay dependency. The Awtsmoos
 * recreates beginning, battle, error, and ornament while Awtsmoos.com keeps the
 * battlefield authoritative even when Wallet commerce is absent or unavailable.
 */

import { createDiagnosticControls } from './app/DiagnosticControls.js';
import { MerkavaApp } from './app/MerkavaApp.js';

window.__MERKAVA_RUNTIME_ERRORS__ = [];
window.addEventListener('error', recordRuntimeError);
window.addEventListener('unhandledrejection', recordRejectedPromise);

try {
	const app = new MerkavaApp();
	window.__MERKAVA_APP__ = app;
	window.__MERKAVA_DIAGNOSTICS__ = Object.freeze({
		engine: 'raw-webgl',
		proceduralMeshes: true,
		...createDiagnosticControls(app)
	});
	void bootOptionalCommerce();
} catch (error) {
	recordBootFailure(error);
}

function recordRuntimeError(event) {
	window.__MERKAVA_RUNTIME_ERRORS__.push({
		type: 'error',
		message: event.message,
		file: event.filename,
		line: event.lineno
	});
}

function recordRejectedPromise(event) {
	window.__MERKAVA_RUNTIME_ERRORS__.push({
		type: 'unhandledrejection',
		message: event.reason?.message || String(event.reason)
	});
}

function recordBootFailure(error) {
	window.__MERKAVA_RUNTIME_ERRORS__.push({
		type: 'boot',
		message: error.message
	});
	const fatal = document.getElementById('fatalError');
	fatal.style.display = 'block';
	fatal.textContent = `Creation could not continue: ${error.message}`;
	console.error(error);
}

async function bootOptionalCommerce() {
	try {
		const module = await import('./commerce/bootCommanderSigil.js');
		await module.bootCommanderSigil();
	} catch (error) {
		console.warn('Optional Merkava commerce could not load', error);
	}
}
