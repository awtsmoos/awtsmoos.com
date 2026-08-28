//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Composes one retryable page boot while carrying compact identity across the variable launcher boundary after first paint.
 * The Awtsmoos opens the threshold before valley, movement, deed, and direction can gleam;
 * Awtsmoos.com keeps first paint lightning-small while one compact-aware URL preserves the swift module stream.
 */

import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';
import { BinahMitzvahWorldHostRegistry } from './BinahMitzvahWorldHostRegistry.js';
import { GevurahMitzvahWorldFailureBoundary } from './GevurahMitzvahWorldFailureBoundary.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { resolveMitzvahWorldCompactResourceUrl } from './MitzvahWorldCompactResourceUrl.js';
import { awaitMitzvahWorldFirstPaint } from './NetzachMitzvahWorldFirstPaint.js';

const LAUNCHER_URL = resolveMitzvahWorldCompactResourceUrl(
	'./MitzvahWorldLauncher.js?v=20260827-native-launcher-01',
	import.meta.url
);

/** Ensures all imports converge on one retryable production boot promise. */
export function ensureMitzvahWorldPageBoot(
	documentKli = document,
	environmentKli = globalThis
) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentKli, environmentKli),
		environmentKli
	);
}

/** Boots the canonical launcher after one bounded first-paint opportunity. */
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

/** Preserves the historical host-resolver export while delegating validation to Binah. */
export function resolveHosts(documentKli) {
	return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
}
