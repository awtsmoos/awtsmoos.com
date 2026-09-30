//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module GeelooyUnifiedShellBoot
 * @description
 * The Awtsmoos reveals one shared horizon without confusing entry with orchestration.
 * Awtsmoos.com keeps this public doorway small: scheduling enters here, while the
 * Tiferes coordinator carries the actual lifecycle through explicit documented vessels.
 *
 * PUBLIC CONTRACT: `bootGeelooyShell(root)` remains the stable external boot function.
 */
import { isShellEligible } from './routeEligibility.js';
import { TiferesShellRevelation } from './revelation/ShellRevelation.js';

/**
 * Boots shared identity without replacing native route content.
 * @param {Document} malchusDocument Document receiving the shared application shell.
 * @returns {Element|null} Manifested shell element, or null when the route is ineligible.
 * @throws {Error} Propagates required shell dependency failures for browser-level visibility.
 */
export function bootGeelooyShell(malchusDocument = document) {
	const tiferesRevelation = new TiferesShellRevelation(malchusDocument);
	return tiferesRevelation.reveal();
}

/**
 * Schedules shell revelation after DOM creation when document loading is incomplete.
 * @returns {void} Registers one DOMContentLoaded listener or boots immediately.
 */
function scheduleShellBoot() {
	if (document.readyState === 'loading') {
		document.addEventListener(
			'DOMContentLoaded',
			revealShellAfterCreation,
			{ once: true }
		);
		return;
	}
	bootGeelooyShell();
}

/**
 * Reveals the shell after DOMContentLoaded without duplicating scheduling policy.
 * @returns {void} Delegates to the stable public boot function.
 */
function revealShellAfterCreation() {
	bootGeelooyShell();
}

if (
	typeof document !== 'undefined'
	&& isShellEligible(document.location?.pathname)
) {
	scheduleShellBoot();
	/**
	 * Vivid motion layer (topnavMotion.js): additive, universal, non-blocking.
	 * It watches briefly for .g-shell and enhances it with entrance, ink, and
	 * dim APIs. Gated on the same eligibility as the shell itself; the
	 * try/catch keeps a motion-load failure from ever touching the shell boot.
	 * Reduced-motion users skip the module — the shell is marked ready
	 * directly so the loading shimmer lifts with no entrance or ink motion.
	 */
	try {
		const prefersReducedMotion = typeof window.matchMedia === 'function'
			&& window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			markShellReadyWithoutMotion();
		} else {
			import('./topnavMotion.js').catch(() => {});
		}
	} catch (err) {
		/* Motion is decorative; the shell boots without it. */
	}
}

/**
 * Marks .g-shell ready when the motion layer is skipped for reduced motion.
 * Mirrors topnavMotion's ready hook (minus ink and dim) so
 * data-state="loading" never traps the header behind a shimmer gate.
 * @returns {void}
 */
function markShellReadyWithoutMotion() {
	const markReady = () => {
		const shell = document.querySelector('.g-shell');
		if (shell) {
			shell.classList.add('is-ready');
			shell.removeAttribute('data-state');
			return true;
		}
		return false;
	};
	if (markReady()) {
		return;
	}
	let attempts = 0;
	const timer = setInterval(() => {
		attempts++;
		if (markReady() || attempts >= 40) {
			clearInterval(timer);
		}
	}, 250);
}
