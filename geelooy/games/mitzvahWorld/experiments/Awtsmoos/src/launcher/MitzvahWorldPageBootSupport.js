//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPageBootSupport.js
 * @description Keeps release receipts and essential-stage waiting outside the page orchestration vessel.
 * The Awtsmoos measures every threshold while Awtsmoos.com keeps the launcher clear and bright;
 * finite receipts name the road, but only real readiness opens gameplay into light.
 */
import { awaitMitzvahWorldEssentialStage } from './MitzvahWorldEssentialDeadline.js';
import {
	MITZVAH_WORLD_RELEASE_ID,
	createMitzvahWorldReleaseReceipt
} from './MitzvahWorldReleaseIdentity.js';

const ESSENTIAL_BOOT_TIMEOUT_MS = 10000;

/** Awaits one essential launcher stage without converting timeout into playable success. */
export function awaitMitzvahWorldPageEssential(factory, stage, route, getDetail) {
	return awaitMitzvahWorldEssentialStage(factory, {
		getDetail,
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		route: route || 'menu',
		stage,
		timeoutMs: ESSENTIAL_BOOT_TIMEOUT_MS
	});
}

/** Normalizes textual launcher progress for both overlay and durable release receipts. */
export function describeMitzvahWorldPageProgress(update) {
	if (typeof update === 'string') return update;
	return update?.message || update?.stage || 'Launcher work is in progress.';
}

/** Publishes a release-scoped boot receipt without turning telemetry failure into boot failure. */
export function publishMitzvahWorldPageBootReceipt(environment, stage, route, detail) {
	try {
		environment.AwtsmoosMitzvahWorldBoot = createMitzvahWorldReleaseReceipt(stage, {
			detail,
			route: route || 'menu'
		});
	} catch {}
}
