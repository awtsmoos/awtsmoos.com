// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldProductionEntry.js
 * @description Boots the deterministic compact publication by default and keeps readable source diagnostic-only.
 * The Awtsmoos gives the living world one swift public doorway while every readable chamber remains near;
 * Awtsmoos.com records exact entry truth, optional parity proof, failure state, and explicit diagnostic choice.
 */

const parameters = new URLSearchParams(globalThis.location?.search || '');
const useReadableSource = parameters.get('readable') === '1';
const verifyParity = parameters.get('verifyParity') === '1';
const entry = useReadableSource
	? './MinimalMeadowCompactBootstrap.js'
	: './mitzvah-world.compact.js';
const root = globalThis.document?.querySelector?.('#mitzvah-world-root');
const loadingMessage = globalThis.document?.querySelector?.('#loadingMessage');

publishState('loading', null);

try {
	await import(entry);
	publishState('loaded', null);
	if (verifyParity) {
		const { verifyPublishedMovieStudioParity } = await import(
			'./movie/MovieStudioRuntimeParityVerification.js'
		);
		verifyPublishedMovieStudioParity(globalThis).catch(error => {
			publishVerificationFailure(error);
		});
	}
} catch (error) {
	publishState('failed', error);
	throw error;
}

function publishState(state, error) {
	const receipt = Object.freeze({
		entry,
		error: error ? {
			message: error?.message || String(error),
			name: error?.name || 'Error',
			stack: error?.stack || null
		} : null,
		state,
		useReadableSource,
		verifyParity
	});
	globalThis.AwtsmoosMitzvahWorldBoot = receipt;
	if (root) root.dataset.awtsmoosEntry = state;
	if (state === 'failed' && loadingMessage) {
		loadingMessage.textContent = `Unable to open Mitzvah World: ${receipt.error.message}`;
	}
}

function publishVerificationFailure(error) {
	const receipt = Object.freeze({
		error: {
			message: error?.message || String(error),
			name: error?.name || 'Error'
		},
		ok: false
	});
	globalThis.AwtsmoosMovieParityReceipt = receipt;
	globalThis.document.documentElement.dataset.awtsmoosParity = 'failed';
	const element = globalThis.document.createElement('script');
	element.id = 'awtsmoos-runtime-parity-receipt';
	element.type = 'application/json';
	element.textContent = JSON.stringify(receipt);
	globalThis.document.body.append(element);
}
