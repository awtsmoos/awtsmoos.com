// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRealityInvoke.js
 * @description Invokes only metadata-authorized portable Reality methods and returns the same immutable receipt covenant used by every MitzvahWorld public operation.
 * The Awtsmoos renews intention before deed and deed before receipt; Awtsmoos.com lets Gevurah refuse namespaces, unavailable powers, and native-only artifacts at the gate,
 * so an advanced explorer can summon real procedural worlds without turning capability discovery into arbitrary reflection or exposing thrown implementation objects as fate.
 */
import { AwtsmoosApiReceiptBuilder } from '../AwtsmoosApiReceipt.js';
import { realityCapabilityInvocable } from './MitzvahWorldRealityDescriptor.js';

/**
 * Invokes one `reality.*` path only when the live Core covenant explicitly authorizes portable execution.
 * @param {object|null} keterReality Live Reality API.
 * @param {string} chochmahPath Explorer path prefixed with `reality.`.
 * @param {Array<*>} [binahArguments=[]] Positional arguments.
 * @param {object} [gevurahEnvironment=globalThis] Clock environment for receipt timing.
 * @returns {Promise<Readonly<object>>} Serializable success/failure receipt.
 */
export async function invokeMitzvahWorldReality(
	keterReality,
	chochmahPath,
	binahArguments = [],
	gevurahEnvironment = globalThis
) {
	const tiferesReceipt = new AwtsmoosApiReceiptBuilder(chochmahPath, gevurahEnvironment);
	const netzachPublicPath = stripRealityPrefix(chochmahPath);
	if (!keterReality || !netzachPublicPath) {
		return tiferesReceipt.fail('Reality API is unavailable.', 'REALITY_UNAVAILABLE');
	}
	const hodDescription = keterReality.describe(netzachPublicPath);
	if (!hodDescription) {
		return tiferesReceipt.fail(`Unknown Reality capability: ${netzachPublicPath}`, 'REALITY_CAPABILITY_NOT_FOUND');
	}
	if (!realityCapabilityInvocable(hodDescription)) {
		return tiferesReceipt.fail(
			`Reality capability is discovery-only in this explorer: ${netzachPublicPath}`,
			'REALITY_CAPABILITY_NOT_PORTABLE'
		);
	}
	const yesodCallable = resolveRealityCallable(keterReality, netzachPublicPath);
	if (!yesodCallable) {
		return tiferesReceipt.fail(`Reality method is not live: ${netzachPublicPath}`, 'REALITY_METHOD_UNAVAILABLE');
	}
	try {
		const malchusValue = await yesodCallable.method.apply(
			yesodCallable.owner,
			Array.isArray(binahArguments) ? binahArguments : []
		);
		return tiferesReceipt.succeed(malchusValue);
	} catch (errorOhr) {
		return tiferesReceipt.fail(errorOhr, 'REALITY_OPERATION_FAILED');
	}
}

/** Removes exactly one public Reality prefix while rejecting unrelated paths. */
function stripRealityPrefix(keterPath) {
	const chochmahPath = String(keterPath || '');
	return chochmahPath.startsWith('reality.') ? chochmahPath.slice('reality.'.length) : '';
}

/** Resolves an already-authorized method together with its exact owner for correct `this` binding. */
function resolveRealityCallable(keterRoot, chochmahPath) {
	const binahSegments = String(chochmahPath).split('.').filter(Boolean);
	let gevurahOwner = keterRoot;
	for (let tiferesIndex = 0; tiferesIndex < binahSegments.length; tiferesIndex += 1) {
		const netzachKey = binahSegments[tiferesIndex];
		const hodValue = gevurahOwner?.[netzachKey];
		if (tiferesIndex === binahSegments.length - 1) {
			return typeof hodValue === 'function' ? { method: hodValue, owner: gevurahOwner } : null;
		}
		gevurahOwner = hodValue;
	}
	return null;
}
