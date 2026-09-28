//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Boots one release graph and owns the final loader-to-playable transition for every gameplay entry.
 * The Awtsmoos renews chooser and meadow, yet never confuses a visible menu with a world beneath the feet;
 * Awtsmoos.com closes the blocking veil after essential and physical truth, and only then lets playable become complete.
 */
import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';
import { BinahMitzvahWorldHostRegistry } from './BinahMitzvahWorldHostRegistry.js';
import { GevurahMitzvahWorldFailureBoundary } from './GevurahMitzvahWorldFailureBoundary.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import {
	awaitMitzvahWorldPageEssential,
	describeMitzvahWorldPageProgress,
	publishMitzvahWorldPageBootReceipt
} from './MitzvahWorldPageBootSupport.js';
import {
	isMitzvahWorldGameplayDiagnostics,
	publishMitzvahWorldPlayable
} from './MitzvahWorldPlayablePublisher.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';
import { awaitMitzvahWorldFirstPaint } from './NetzachMitzvahWorldFirstPaint.js';

const LAUNCHER_URL = resolveMitzvahWorldReleaseResourceUrl('./MitzvahWorldLauncher.js', import.meta.url);

/** Ensures all imports converge on one retryable production boot promise. */
export function ensureMitzvahWorldPageBoot(documentKli = document, environmentKli = globalThis) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentKli, environmentKli),
		environmentKli
	);
}

/** Boots the canonical launcher and publishes gameplay only through the strict page-owned gate. */
export async function bootMitzvahWorldPage(documentKli = document, environmentKli = globalThis) {
	const rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
	const hostsYesod = resolveHosts(documentKli);
	const loadingMalchus = new MeadowLoadingScreen(documentKli, environmentKli);
	const failureGevurah = new GevurahMitzvahWorldFailureBoundary(hostsYesod.hud, documentKli, environmentKli);
	const route = environmentKli.location?.search || '';
	let detail = 'Preparing essential launcher capability…';
	failureGevurah.install();
	publishMitzvahWorldPageBootReceipt(environmentKli, 'painting', route, detail);
	rootStateMalchus.setBootStage('painting');
	await awaitMitzvahWorldFirstPaint(environmentKli);
	try {
		rootStateMalchus.setBootStage('launcher-loading');
		publishMitzvahWorldPageBootReceipt(environmentKli, 'launcher-loading', route, detail);
		const launcherModule = await awaitMitzvahWorldPageEssential(
			() => import(LAUNCHER_URL),
			'launcher-module',
			route,
			() => detail
		);
		rootStateMalchus.setBootStage('launching');
		publishMitzvahWorldPageBootReceipt(environmentKli, 'launching', route, detail);
		const finalizeGameplay = diagnostics => publishMitzvahWorldPlayable(diagnostics, {
			documentValue: documentKli,
			environment: environmentKli,
			loading: loadingMalchus
		});
		const launchedTiferes = await awaitMitzvahWorldPageEssential(
			() => launcherModule.launchMitzvahWorld(hostsYesod, route, {
				environment: environmentKli,
				onProgress: updateOhr => {
					detail = describeMitzvahWorldPageProgress(updateOhr);
					loadingMalchus.world(updateOhr);
					publishMitzvahWorldPageBootReceipt(environmentKli, 'launching', route, detail);
				},
				onWorldLaunchComplete: finalizeGameplay
			}),
			'launcher-route',
			route,
			() => detail
		);
		if (isMitzvahWorldGameplayDiagnostics(launchedTiferes)) {
			finalizeGameplay(launchedTiferes);
		} else {
			loadingMalchus.finish();
		}
		environmentKli.AwtsmoosMitzvahWorld = launchedTiferes;
		rootStateMalchus.setBootStage('ready');
		publishMitzvahWorldPageBootReceipt(environmentKli, 'ready', route, 'Launcher completed.');
		return launchedTiferes;
	} catch (errorOhr) {
		publishMitzvahWorldPageBootReceipt(environmentKli, 'fatal', route, errorOhr?.message || String(errorOhr));
		loadingMalchus.fail(errorOhr);
		failureGevurah.show(errorOhr);
		throw errorOhr;
	}
}

/** Resolves and validates the historical DOM host collection through the Binah registry. */
export function resolveHosts(documentKli) {
	return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
}
