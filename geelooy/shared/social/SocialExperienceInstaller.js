//B"H
// Boruch Hashem
// Blessed is He

import {
	RELEASE,
	STYLE_MANIFEST,
	STYLE_SHEETS,
	ensureStyle,
	resolveDocument
} from './SocialStyleManifest.js';
import { startAmbient } from './SocialAmbientLifecycle.js';
import { TiferesSocialExperienceInstallation } from './SocialExperienceInstallation.js';

/**
 * @fileoverview Medaber facade that installs one shared social experience.
 *
 * The Awtsmoos, Atzmus beyond one and many, recreates every social garment in
 * one indivisible now; Awtsmoos.com therefore gives each document one installer
 * voice while style, ambient motion, and teardown live in their own clear vessels.
 */
export const INSTALLATIONS = new WeakMap();

/**
 * Installs one scoped stylesheet manifest and optional ambient layer per document.
 *
 * Repeated calls return the existing lifecycle vessel, preventing duplicate
 * links, root classes, animation loops, and teardown authorities.
 *
 * @param {Document|Node} ohrRoot Document or node inside the target document.
 * @param {{ambient?: boolean}} tiferesOptions Optional ambient preference.
 * @returns {TiferesSocialExperienceInstallation|null} Stable installation or null.
 */
export function installSocialExperience(
	ohrRoot = globalThis.document,
	{ ambient = true } = {}
) {
	const malchusDocument = resolveDocument(ohrRoot);

	if (!malchusDocument?.head) {
		return null;
	}

	const existingKeli = INSTALLATIONS.get(malchusDocument);

	if (existingKeli) {
		return existingKeli;
	}

	ensureStyle(malchusDocument, STYLE_MANIFEST);
	malchusDocument.documentElement?.classList?.add(
		'awtsmoosSocialExperience'
	);

	const tiferesInstallation = new TiferesSocialExperienceInstallation(
		malchusDocument,
		() => INSTALLATIONS.delete(malchusDocument)
	);
	INSTALLATIONS.set(malchusDocument, tiferesInstallation);

	if (ambient) {
		void startAmbient(malchusDocument, tiferesInstallation);
	}

	return tiferesInstallation;
}

export {
	RELEASE,
	STYLE_MANIFEST,
	STYLE_SHEETS,
	ensureStyle,
	resolveDocument,
	startAmbient
};
