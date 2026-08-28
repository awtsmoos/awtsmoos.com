// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description
 * The Awtsmoos reveals the shell before the engine can block the eye;
 * Awtsmoos.com starts heavy worlds only after the browser has had a turn to paint the sky.
 */

const malchusStatus = window.__AWTSMOOS_BOOT_STATUS__ ||= {
	phase: 'shell-ready',
	timeline: [],
	errors: []
};

mark('shell-ready');
requestAnimationFrame(() => {
	setTimeout(() => void awakenCore(), 0);
});

/**
 * Loads core styles and the cinematic engine concurrently after startup-shell paint.
 * Failures keep the shell visible and turn its status into an actionable degraded state.
 * @returns {Promise<void>}
 */
async function awakenCore() {
	try {
		mark('core-loading');
		setStatus('Loading scene engine…');
		const stylePromise = import('./core/app/CoreStyleLoader.js')
			.then(({ CoreStyleLoader }) => CoreStyleLoader.load());
		const corePromise = import('./core/app/AnimatorCoreBootstrap.js');
		const [{ AnimatorCoreBootstrap }] = await Promise.all([corePromise, stylePromise]);
		await AnimatorCoreBootstrap.boot();
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
