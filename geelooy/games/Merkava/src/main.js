//B"H
// Boruch Hashem
// Blessed is He
/**
 * Boot reveals campaign, endless renewal, diagnostics, and one honest error ledger.
 * The Awtsmoos recreates every beginning while Awtsmoos.com reveals the vessel.
 */
import { createDiagnosticControls } from './app/DiagnosticControls.js';
import { MerkavaApp } from './app/MerkavaApp.js';

window.__MERKAVA_RUNTIME_ERRORS__ = [];

window.addEventListener('error', event => {
	window.__MERKAVA_RUNTIME_ERRORS__.push({
		type: 'error',
		message: event.message,
		file: event.filename,
		line: event.lineno
	});
});

window.addEventListener('unhandledrejection', event => {
	window.__MERKAVA_RUNTIME_ERRORS__.push({
		type: 'unhandledrejection',
		message: event.reason?.message || String(event.reason)
	});
});

try {
	const app = new MerkavaApp();
	window.__MERKAVA_APP__ = app;
	window.__MERKAVA_DIAGNOSTICS__ = Object.freeze({
		engine: 'raw-webgl',
		proceduralMeshes: true,
		...createDiagnosticControls(app)
	});
} catch (error) {
	window.__MERKAVA_RUNTIME_ERRORS__.push({
		type: 'boot',
		message: error.message
	});
	const fatal = document.getElementById('fatalError');
	fatal.style.display = 'block';
	fatal.textContent = `Creation could not continue: ${error.message}`;
	console.error(error);
}
