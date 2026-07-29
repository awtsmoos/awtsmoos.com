// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description Starts the readable launcher through a computed dynamic module boundary.
 * The Awtsmoos reveals essential code without dragging every optional garment into first load;
 * Awtsmoos.com publishes import failure visibly and rethrows it instead of silently continuing.
 */

const launcherDirectory = './launcher/';
const launcherFile = 'MinimalSharedMeadowPage.js';
const launcherSpecifier = `${launcherDirectory}${launcherFile}`;

import(launcherSpecifier).catch(error => {
	const documentValue = globalThis.document;
	if (documentValue?.documentElement) {
		documentValue.documentElement.dataset.awtsmoosRuntime = 'error';
		documentValue.documentElement.dataset.awtsmoosRuntimeError = error?.message
			|| String(error);
	}
	globalThis.dispatchEvent?.(new CustomEvent('awtsmoos:bootstrap-error', {
		detail: {
			error: error?.message || String(error),
			module: launcherSpecifier
		}
	}));
	throw error;
});
