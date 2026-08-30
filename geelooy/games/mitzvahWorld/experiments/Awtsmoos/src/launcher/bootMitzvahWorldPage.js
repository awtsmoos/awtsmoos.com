//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Composes one retryable page boot while keeping the variable launcher door explicitly CompactJS-owned after first paint.
 * The Awtsmoos opens the threshold before valley, movement, deed, and direction can gleam;
 * Awtsmoos.com keeps first paint lightning-small while the authored compact query makes every later launcher graph visible to builder, reviewer, and stream.
 */

import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';
import { BinahMitzvahWorldHostRegistry } from './BinahMitzvahWorldHostRegistry.js';
import { GevurahMitzvahWorldFailureBoundary } from './GevurahMitzvahWorldFailureBoundary.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { awaitMitzvahWorldFirstPaint } from './NetzachMitzvahWorldFirstPaint.js';

const LAUNCHER_URL = './MitzvahWorldLauncher.js?compact=true&v=20260828-open-world-launcher-01';

/**
 * Ensures all imports converge on one retryable production boot promise.
 * @param {Document} [documentKli=document] Active MitzvahWorld document vessel.
 * @param {object} [environmentKli=globalThis] Browser-like environment carrying location and globals.
 * @returns {Promise<object>} One shared boot promise for every caller in this page lifetime.
 */
export function ensureMitzvahWorldPageBoot(
	documentKli = document,
	environmentKli = globalThis
) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentKli, environmentKli),
		environmentKli
	);
}

/**
 * Boots the canonical compact launcher after one bounded first-paint opportunity.
 * @param {Document} [documentKli=document] Active MitzvahWorld document vessel.
 * @param {object} [environmentKli=globalThis] Browser-like execution environment.
 * @returns {Promise<object>} Launched MitzvahWorld controller and runtime surface.
 */
export async function bootMitzvahWorldPage(
	documentKli = document,
	environmentKli = globalThis
) {
	const rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
	const hostsYesod = resolveHosts(documentKli);
	const loadingMalchus = new MeadowLoadingScreen(documentKli, environmentKli);
	const failureGevurah = new GevurahMitzvahWorldFailureBoundary(
		hostsYesod.hud,
		documentKli,
		environmentKli
	);
	failureGevurah.install();
	rootStateMalchus.setBootStage('painting');
	await awaitMitzvahWorldFirstPaint(environmentKli);
	rootStateMalchus.setBootStage('launching');
	try {
		const { launchMitzvahWorld } = await import(LAUNCHER_URL);
		const launchedTiferes = await launchMitzvahWorld(
			hostsYesod,
			environmentKli.location?.search || '',
			{
				environment: environmentKli,
				onProgress: updateOhr => loadingMalchus.world(updateOhr)
			}
		);
		environmentKli.AwtsmoosMitzvahWorld = launchedTiferes;
		rootStateMalchus.setBootStage('ready');
		loadingMalchus.finish();
		return launchedTiferes;
	} catch (errorOhr) {
		loadingMalchus.fail(errorOhr);
		failureGevurah.show(errorOhr);
		throw errorOhr;
	}
}

/**
 * Resolves and validates the historical DOM host collection through the Binah registry.
 * @param {Document} documentKli Active MitzvahWorld document.
 * @returns {object} Validated launcher host references.
 */
export function resolveHosts(documentKli) {
	return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
}
