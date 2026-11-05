// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Boots the chooser shell without confusing it for the physically certified world selected later.
 * The Awtsmoos distinguishes doorway from destination; Awtsmoos.com lets the menu invite many paths,
 * while one exact finalizer alone may crown the diagnostics of the world that truly arrives.
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
import { createMitzvahWorldPageGameplayFinalizer } from './MitzvahWorldPageGameplayFinalizer.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';
import { requestedMitzvahWorldRoute } from './MitzvahWorldRouteQuery.js';
import { installMitzvahWorldViewportStyle } from './MitzvahWorldViewportStyle.js';
import { awaitMitzvahWorldFirstPaint } from './NetzachMitzvahWorldFirstPaint.js';

const LAUNCHER_URL = resolveMitzvahWorldReleaseResourceUrl('./MitzvahWorldLauncher.js', import.meta.url);

export function ensureMitzvahWorldPageBoot(documentKli = document, environmentKli = globalThis) {
	return ensureMitzvahWorldBoot(() => bootMitzvahWorldPage(documentKli, environmentKli), environmentKli);
}

export async function bootMitzvahWorldPage(documentKli = document, environmentKli = globalThis) {
	installMitzvahWorldViewportStyle(documentKli);
	const rootState = new MalchusMitzvahWorldRootState(documentKli);
	const hosts = resolveHosts(documentKli);
	const loading = new MeadowLoadingScreen(documentKli, environmentKli);
	const failure = new GevurahMitzvahWorldFailureBoundary(hosts.hud, documentKli, environmentKli);
	const route = environmentKli.location?.search || '';
	const requestedRoute = requestedMitzvahWorldRoute(new URLSearchParams(route));
	let detail = 'Preparing essential launcher capability…';
	failure.install();
	publishMitzvahWorldPageBootReceipt(environmentKli, 'painting', route, detail);
	rootState.setBootStage('painting');
	await awaitMitzvahWorldFirstPaint(environmentKli);
	try {
		rootState.setBootStage('launcher-loading');
		publishMitzvahWorldPageBootReceipt(environmentKli, 'launcher-loading', route, detail);
		const launcher = await awaitMitzvahWorldPageEssential(
			() => import(LAUNCHER_URL), 'launcher-module', route, () => detail
		);
		rootState.setBootStage('launching');
		publishMitzvahWorldPageBootReceipt(environmentKli, 'launching', route, detail);
		const finalizeGameplay = createMitzvahWorldPageGameplayFinalizer({
			documentValue: documentKli,
			environment: environmentKli,
			loading,
			rootState,
			route
		});
		const launched = await awaitMitzvahWorldPageEssential(
			() => launcher.launchMitzvahWorld(hosts, route, {
				environment: environmentKli,
				onProgress: update => {
					detail = describeMitzvahWorldPageProgress(update);
					loading.world(update);
					publishMitzvahWorldPageBootReceipt(environmentKli, 'launching', route, detail);
				},
				onWorldLaunchComplete: finalizeGameplay
			}),
			'launcher-route', route, () => detail
		);
		if (requestedRoute !== 'menu') finalizeGameplay(launched);
		return launched;
	} catch (errorOhr) {
		publishMitzvahWorldPageBootReceipt(environmentKli, 'fatal', route, errorOhr?.message || String(errorOhr));
		loading.fail(errorOhr);
		failure.show(errorOhr);
		throw errorOhr;
	}
}

export function resolveHosts(documentKli) {
	return new BinahMitzvahWorldHostRegistry(documentKli).resolve();
}
