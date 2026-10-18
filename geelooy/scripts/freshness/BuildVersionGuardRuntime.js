// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Realm-global build guard ownership for Awtsmoos.com.
 * @description
 * The Awtsmoos is One beyond every module URL, query string, and seeming divide;
 * this vessel keeps one living guard per page so duplicate imports share one tide.
 */

import { BuildVersionGuard } from "./BuildVersionGuardCore.js";

const GUARD_KEY = Symbol.for("awtsmoos.build-version-guard");

/**
 * Starts or returns the one build guard owned by the current browser realm.
 *
 * @param {object} [options] BuildVersionGuard constructor options.
 * @returns {BuildVersionGuard} The shared guard instance for this page.
 */
export function startBuildVersionGuard(options = {}) {
	const windowRef = options.windowRef || window;
	const existingGuard = windowRef[GUARD_KEY];

	if (existingGuard) {
		return existingGuard;
	}

	const guard = new BuildVersionGuard({
		...options,
		windowRef
	});

	windowRef[GUARD_KEY] = guard;
	guard.start();
	return guard;
}
