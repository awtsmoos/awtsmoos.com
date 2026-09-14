//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Boots one release-consistent page graph and converts every essential launcher wait into measured success or visible finite failure.
 * The Awtsmoos renews the threshold and the traveler each instant in one light; Awtsmoos.com gives every boot stage a name and every wait a bound,
 * so the meadow may appear through truthful readiness while a broken doorway can never imprison the player in silent zero-percent night.
 */

import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';
import { BinahMitzvahWorldHostRegistry } from './BinahMitzvahWorldHostRegistry.js';
import { GevurahMitzvahWorldFailureBoundary } from './GevurahMitzvahWorldFailureBoundary.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { awaitMitzvahWorldEssentialStage } from './MitzvahWorldEssentialDeadline.js';
import {
	MITZVAH_WORLD_RELEASE_ID,
	createMitzvahWorldReleaseReceipt
} from './MitzvahWorldReleaseIdentity.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';
import { awaitMitzvahWorldFirstPaint } from './NetzachMitzvahWorldFirstPaint.js';

const ESSENTIAL_BOOT_TIMEOUT_MS = 10000;
const LAUNCHER_URL = resolveMitzvahWorldReleaseResourceUrl(
	'./MitzvahWorldLauncher.js',
	import.meta.url
);

/** Ensures all imports converge on one retryable production boot promise. */
export function ensureMitzvahWorldPageBoot(documentKli = document, environmentKli = globalThis) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentKli, environmentKli),
		environmentKli
	);
}

/** Boots the canonical launcher through finite essential stages and one release identity. */
export async function bootMitzvahWorldPage(documentKli = document, environmentKli = globalThis) {
	const rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
	const hostsYesod = resolveHosts(documentKli);
	const loadingMalchus = new MeadowLoadingScreen(documentKli, environmentKli);
	const failureGevurah = new GevurahMitzvahWorldFailureBoundary(hostsYesod.hud, documentKli, environmentKli);
	const route = environmentKli.location?.search || '';
	let lastProgressDetail = 'Preparing essential launcher capability…';
	failureGevurah.install();
	publishBootReceipt(environmentKli, 'painting', route, lastProgressDetail);
	rootStateMalchus.setBootStage('painting');
	await awaitMitzvahWorldFirstPaint(environmentKli);
	try {
		rootStateMalchus.setBootStage('launcher-loading');
		publishBootReceipt(environmentKli, 'launcher-loading', route, lastProgressDetail);
		const launcherModule = await awaitEssential(
			() => import(LAUNCHER_URL),
			'launcher-module',
			route,
			() => lastProgressDetail
		);
		rootStateMalchus.setBootStage('launching');
		publishBootReceipt(environmentKli, 'launching', route, lastProgressDetail);
		const launchedTiferes = await awaitEssential(
			() => launcherModule.launchMitzvahWorld(hostsYesod, route, {
				environment: environmentKli,
				onProgress: updateOhr => {
					lastProgressDetail = progressDetail(updateOhr);
					loadingMalchus.world(updateOhr);
					publishBootReceipt(environmentKli, 'launching', route, lastProgressDetail);
				}
			}),
			'launcher-route',
			route,
			() => lastProgressDetail
		);
		environmentKli.AwtsmoosMitzvahWorld = launchedTiferes;
		rootStateMalchus.setBootStage('ready');
		publishBootReceipt(environmentKli, 'ready', route, 'Launcher completed.');
		loadingMalchus.finish();
		return launchedTiferes;
	} catch (errorOhr) {
		publishBootReceipt(environmentKli, 'fatal', route, errorOhr?.message || String(errorOhr));
		loadingMalchus.fail(errorOhr);
		failureGevurah.show(errorOhr);
		throw errorOhr;
	}
}

/** Resolves and validates the historical DOM host collection through the Binah registry. */
export function resolveHosts(documentKli) {
	return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
}

function awaitEssential(factory, stage, route, getDetail) {
	return awaitMitzvahWorldEssentialStage(factory, {
		getDetail,
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		route: route || 'menu',
		stage,
		timeoutMs: ESSENTIAL_BOOT_TIMEOUT_MS
	});
}

function progressDetail(updateOhr) {
	if (typeof updateOhr === 'string') return updateOhr;
	return updateOhr?.message || updateOhr?.stage || 'Launcher work is in progress.';
}

function publishBootReceipt(environmentKli, stage, route, detail) {
	try {
		environmentKli.AwtsmoosMitzvahWorldBoot = createMitzvahWorldReleaseReceipt(stage, { detail, route: route || 'menu' });
	} catch {}
}
