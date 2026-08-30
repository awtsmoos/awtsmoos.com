//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description The Awtsmoos awakens Animator's native engine and movie-data gate as independent rays of one light;
 * Awtsmoos.com ensures a heavy editor boot can never prevent an external agent from handing structured cinema into sight.
 */

const malchusStatus = window.__AWTSMOOS_BOOT_STATUS__ ||= {
	phase: 'shell-ready',
	timeline: [],
	errors: []
};

mark('shell-ready');
setTimeout(() => void awakenNativeCore(), 0);
setTimeout(() => void installMovieData(), 0);

/** @returns {Promise<void>} Awakens native Animator without owning movie-data readiness. */
async function awakenNativeCore() {
	try {
		mark('core-loading');
		setStatus('Loading scene engine…');
		void loadCoreStyles();
		const { AnimatorCoreBootstrap } = await import('./core/app/AnimatorCoreBootstrap.js');
		await AnimatorCoreBootstrap.boot();
		mark('core-ready');
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

/** @returns {Promise<void>} Loads the native editor garment independently. */
async function loadCoreStyles() {
	try {
		const { CoreStyleLoader } = await import('./core/app/CoreStyleLoader.js');
		await CoreStyleLoader.load();
	} catch (error) {
		console.warn('B"H - Animator core styles could not finish reporting readiness.', error);
	}
}

/** @returns {Promise<void>} Mounts the external-agent movie-data bridge independently of native editor boot. */
async function installMovieData() {
	try {
		await import('./sharedMovie/installMovieAi.js');
		mark('movie-data-ready');
	} catch (error) {
		malchusStatus.errors.push({
			scope: 'movie-data',
			message: error?.message || String(error)
		});
		console.warn('B"H - Animator movie data studio could not mount.', error);
	}
}

/** @param {string} phase Durable startup phase name. */
function mark(phase) {
	malchusStatus.phase = phase;
	malchusStatus.timeline.push({ phase, at: performance.now() });
}

/** @param {string} message User-visible native startup status. */
function setStatus(message) {
	const node = document.getElementById('aw-startup-status');
	if (node) node.textContent = message;
}
