//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPlayablePublisher.js
 * @description Owns the sole page-level covenant that may publish a staged gameplay runtime as playable.
 * The Awtsmoos joins rendered light, rooted earth, moving feet, a living camera, and the vanished veil in one refrain;
 * Awtsmoos.com speaks playable only when every finite witness agrees, so an empty world can never borrow success's name.
 */
import { getMitzvahWorldEssentialBootSnapshot } from '../app/MitzvahWorldEssentialBoot.js';
import { markRuntimePlayable } from '../app/RuntimeStateMarker.js';
import {
	inspectMinimalMeadowOverlayDismissal,
	inspectMinimalMeadowPlayableRuntime
} from './MinimalMeadowPlayableEvidence.js';

/** Returns true only for diagnostics that expose the real staged gameplay runtime. */
export function isMitzvahWorldGameplayDiagnostics(diagnostics) {
	return Boolean(diagnostics?.runtime && typeof diagnostics.runtime === 'object');
}

/** Publishes gameplay only after essential, physical, and blocking-overlay evidence all succeed. */
export function publishMitzvahWorldPlayable(diagnostics, options = {}) {
	if (diagnostics?.playableEvidence?.ready === true) return diagnostics.playableEvidence;
	const environment = options.environment || globalThis;
	const documentValue = options.documentValue || environment.document;
	const loading = options.loading;
	const essential = getMitzvahWorldEssentialBootSnapshot(environment);
	assertEssentialReady(essential);
	const physical = inspectMinimalMeadowPlayableRuntime(diagnostics?.runtime);
	assertReceiptReady('physical gameplay', physical);
	if (!loading || typeof loading.finish !== 'function') {
		throw new Error('Mitzvah World playable publication requires the page-owned loading screen.');
	}
	loading.finish();
	const overlay = inspectMinimalMeadowOverlayDismissal(documentValue);
	assertReceiptReady('blocking overlay dismissal', overlay);
	const receipt = Object.freeze({ essential, overlay, physical, ready: true });
	diagnostics.playableEvidence = receipt;
	environment.AwtsmoosBootError = null;
	environment.AwtsmoosDiagnostics = diagnostics;
	markRuntimePlayable(diagnostics, documentValue);
	diagnostics.activatePostPlayable?.();
	return receipt;
}

function assertEssentialReady(essential) {
	if (essential?.certified === true) return;
	const missing = Object.entries(essential?.milestones || {})
		.filter(([, record]) => record.status !== 'complete')
		.map(([name]) => name)
		.join(', ') || 'unknown-essential-proof';
	throw new Error(`Mitzvah World essential readiness is incomplete: ${missing}`);
}

function assertReceiptReady(label, receipt) {
	if (receipt?.ready === true) return;
	const missing = Array.isArray(receipt?.missing) && receipt.missing.length
		? receipt.missing.join(', ')
		: `missing-${label}`;
	throw new Error(`Mitzvah World ${label} is incomplete: ${missing}`);
}
