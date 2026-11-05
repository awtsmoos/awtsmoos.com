// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerDescriptorMetadata.js
 * @description Preserves the focused explorer metadata API while delegating semantic interpretation to one richer immutable descriptor-meta covenant.
 * The Awtsmoos is one before old and new names divide a module; Awtsmoos.com lets Yesod keep stable imports while deeper Daas grows beneath them in rhyme,
 * so selection and rendering gain stability, side-effect, invocation, safety, mode, arity, and future extension evidence without duplicating tag parsing in every view.
 */
import { createApiExplorerDescriptorMeta } from './MitzvahWorldApiExplorerDescriptorMeta.js';

/** Reports whether one descriptor may be invoked from the portable explorer. */
export function apiExplorerDescriptorExecutable(keterDescriptor) {
	return Boolean(createApiExplorerDescriptorMeta(keterDescriptor)?.executable);
}

/** Returns one prefixed descriptor tag value or a stable fallback. */
export function apiExplorerDescriptorTagValue(keterDescriptor, chochmahPrefix, binahFallback = '') {
	const gevurahPrefix = `${String(chochmahPrefix)}:`;
	const tiferesToken = (keterDescriptor?.tags || []).find((netzachTag) => {
		return String(netzachTag).startsWith(gevurahPrefix);
	});
	return tiferesToken ? String(tiferesToken).slice(gevurahPrefix.length) : binahFallback;
}

/** Creates ordered compatibility badges from the richer canonical metadata model. */
export function apiExplorerDescriptorBadges(keterDescriptor) {
	const chochmahMeta = createApiExplorerDescriptorMeta(keterDescriptor);
	if (!chochmahMeta) return Object.freeze([]);
	return Object.freeze(chochmahMeta.badges.map((binahBadge) => {
		return Object.freeze({
			kind: badgeKind(binahBadge.label),
			tone: binahBadge.tone,
			value: binahBadge.value
		});
	}));
}

/** Returns aliases encoded by the descriptor bridge. */
export function apiExplorerDescriptorAliases(keterDescriptor) {
	return createApiExplorerDescriptorMeta(keterDescriptor)?.aliases || Object.freeze([]);
}

/** Normalizes one human badge label into a stable data-attribute kind. */
function badgeKind(keterLabel) {
	return String(keterLabel || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-');
}
