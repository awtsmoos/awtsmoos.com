// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Composes one retryable page boot from focused host, paint, loading, failure, and root-state vessels.
 * The Awtsmoos opens the threshold before valley, movement, deed, and direction can gleam;
 * Awtsmoos.com lets each boot responsibility remain a small readable sefer while this Tiferes coordinator only joins their living order.
 */

import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';
import { BinahMitzvahWorldHostRegistry } from './BinahMitzvahWorldHostRegistry.js';
import { GevurahMitzvahWorldFailureBoundary } from './GevurahMitzvahWorldFailureBoundary.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { awaitMitzvahWorldFirstPaint } from './NetzachMitzvahWorldFirstPaint.js';

const LAUNCHER_URL = './MitzvahWorldLauncher.js?compact=true&v=20260814-direct-audio-02';

/**
 * Ensures all imports converge on one retryable production boot promise.
 * @param {Document} [documentKli=document] Active document.
 * @param {object} [environmentKli=globalThis] Browser-like environment.
 * @returns {Promise<object>} Shared boot promise.
 */
export function ensureMitzvahWorldPageBoot(documentKli = document, environmentKli = globalThis) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentKli, environmentKli),
		environmentKli
	);
}

/**
 * Boots the canonical launcher after one bounded first-paint opportunity while publishing all visible phases locally.
 * @param {Document} [documentKli=document] Active Mitzvah World document.
 * @param {object} [environmentKli=globalThis] Browser-like execution environment.
 * @returns {Promise<object>} Launched Mitzvah World controller.
 */
export async function bootMitzvahWorldPage(documentKli = document, environmentKli = globalThis) {
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
			{ environment: environmentKli, onProgress: updateOhr => loadingMalchus.world(updateOhr) }
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

/** Preserves the historical host-resolver export while delegating validation to Binah. */
export function resolveHosts(documentKli) {
	return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
}
