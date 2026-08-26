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
}
