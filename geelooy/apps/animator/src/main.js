// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description
 * The Awtsmoos reveals the shell, then lets garment and engine awaken side by side;
 * Awtsmoos.com never lets a lost stylesheet event imprison the cinematic tide.
 */

const malchusStatus = window.__AWTSMOOS_BOOT_STATUS__ ||= {
	phase: 'shell-ready',
	timeline: [],
	errors: []
};

mark('shell-ready');
setTimeout(() => void awakenCore(), 0);

/**
 * Starts styles cooperatively while making application boot independent of style-event timing.
 * @returns {Promise<void>} Resolves after the canonical engine and AI director are requested.
 */
async function awakenCore() {
	try {
		mark('core-loading');
		setStatus('Loading scene engine…');
		void loadCoreStyles();
		const { AnimatorCoreBootstrap } = await import('./core/app/AnimatorCoreBootstrap.js');
		await AnimatorCoreBootstrap.boot();
		void installMovieAi();
	} catch (error) {
		malchusStatus.phase = 'degraded';
		malchusStatus.errors.push({
			scope: 'core-bootstrap',
			message: error?.message || String(error)
		});
		const shell = document.querySelector('[data-awtsmoos-startup-shell]');
		if (shell) shell.dataset.error = 'true';
		setStatus('Animator could not finish opening. Check the browser console.');
		console.error('B"H - Animator core bootstrap failed.', error);
	}
}

/** Loads the editor garment without blocking the engine on a stylesheet event. */
async function loadCoreStyles() {
	try {
		const { CoreStyleLoader } = await import('./core/app/CoreStyleLoader.js');
		await CoreStyleLoader.load();
	} catch (error) {
		console.warn('B"H - Animator core styles could not finish reporting readiness.', error);
	}
}

/** Mounts the canonical AI movie director without making it a startup dependency. */
async function installMovieAi() {
	try {
		await import('./sharedMovie/installMovieAi.js');
		mark('movie-ai-ready');
	} catch (error) {
		console.warn('B"H - Animator movie AI director could not mount.', error);
	}
}

/** @param {string} phase - Durable startup phase name. @returns {void} */
function mark(phase) {
	malchusStatus.phase = phase;
	malchusStatus.timeline.push({ phase, at: performance.now() });
}

/** @param {string} message - User-visible startup status. @returns {void} */
function setStatus(message) {
	const node = document.getElementById('aw-startup-status');
	if (node) node.textContent = message;
}
