// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelStudioFrame
 * @description
 * The Awtsmoos opens a dedicated social host that imports the current
 * MitzvahWorld launcher and movie modules. Awtsmoos.com measures origin and
 * readiness while the public gameplay page remains entirely unchanged.
 */

const PROJECT_URL = '/games/mitzvahWorld/movies/projects/chossid-journey-30s.json';
export const REEL_STUDIO_PATH = `/social-composer/reel-studio/?mode=movie&movieUrl=${encodeURIComponent(PROJECT_URL)}`;

export function createReelStudioFrame(documentRoot = document) {
	const iframe = documentRoot.createElement('iframe');
	iframe.className = 'reel-studio-frame';
	iframe.title = 'MitzvahWorld Movie Studio';
	iframe.allow = 'autoplay; fullscreen';
	iframe.loading = 'eager';
	iframe.referrerPolicy = 'same-origin';
	iframe.src = REEL_STUDIO_PATH;
	return iframe;
}

export async function waitForReelStudio(iframe, options = {}) {
	const timeout = Number(options.timeout) || 120000;
	const interval = Number(options.interval) || 250;
	const expectedOrigin = new URL(iframe.src, location.href).origin;
	if (expectedOrigin !== location.origin) {
		throw new Error('MitzvahWorld Studio must remain on the same origin.');
	}
	const started = performance.now();
	while (performance.now() - started < timeout) {
		const studio = studioFromFrame(iframe);
		if (studio?.ready) return studio;
		const hostError = iframe.contentWindow?.AwtsmoosReelStudioError;
		if (hostError) throw new Error(String(hostError));
		await delay(interval);
	}
	throw new Error('MitzvahWorld Studio did not become ready in time.');
}

export function studioFromFrame(iframe) {
	try {
		return iframe.contentWindow?.AwtsmoosMovie || null;
	} catch {
		throw new Error('MitzvahWorld Studio is not accessible from this page.');
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
