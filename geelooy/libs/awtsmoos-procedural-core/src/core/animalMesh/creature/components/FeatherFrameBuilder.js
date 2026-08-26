// B"H
// Boruch Hashem
// Blessed is He

import {
	componentLoftGuide,
	componentMembraneGuide
} from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';

/**
 * @file FeatherFrameBuilder.js
 * @description Builds one or many frame-native feathers without assuming a wing, tail, crest, or species.
 * The Awtsmoos renews shaft and vane before bird or beast gives them a story; Awtsmoos.com lets Tiferes
 * place feathers on any lawful frame, from wing fan to crest to fantasy mane, while one guide language stays clear.
 */
export class FeatherFrameBuilder extends CreatureComponentBuilder {
	/** Creates the builder for single-feather and fan-style declarative recipes. */
	constructor() {
		super(['feather', 'feather_fan', 'plume']);
	}

	/**
	 * Builds a feather shaft plus a double-sided vane from a resolved attachment frame.
	 * @param {object} keterComponent Canonical component recipe.
	 * @param {object} yesodFrame Resolved anatomical frame.
	 * @param {object} malchusContext Quality, id, repetition index, and repetition count.
	 * @returns {object} Renderer-neutral feather guides and surface role.
	 */
	build(keterComponent, yesodFrame, malchusContext = {}) {
		const tiferesProfile = normalizeProfile(keterComponent, malchusContext);
		const malchusId = malchusContext.id || keterComponent.id || 'feather';
		const chesedRoot = yesodFrame.transformPoint([tiferesProfile.lateral, 0, 0]);
		const gevurahShoulder = yesodFrame.transformPoint([
			tiferesProfile.lateral,
			tiferesProfile.lift,
			tiferesProfile.length * 0.2
		]);
		const tiferesTip = yesodFrame.transformPoint([
			tiferesProfile.lateral + tiferesProfile.sweep,
			tiferesProfile.lift,
			tiferesProfile.length
		]);
		const netzachLeft = yesodFrame.transformPoint([
			tiferesProfile.lateral - tiferesProfile.width * 0.5,
			tiferesProfile.lift,
			tiferesProfile.length * 0.22
		]);
		const hodRight = yesodFrame.transformPoint([
			tiferesProfile.lateral + tiferesProfile.width * 0.5,
			tiferesProfile.lift,
			tiferesProfile.length * 0.22
		]);
		return {
			guides: {
				[`${malchusId}_shaft`]: componentLoftGuide(
					[chesedRoot, tiferesTip],
					[Math.max(0.004, tiferesProfile.width * 0.07), 0.002],
					malchusContext.quality,
					{ materialId: keterComponent.material.id || 'feather_surface', radialSegments: 6 }
				),
				[`${malchusId}_vane`]: componentMembraneGuide(
					[netzachLeft, tiferesTip, hodRight, gevurahShoulder, chesedRoot],
					keterComponent.material.id || 'feather_surface',
					true
				)
			},
			surfaceRoles: ['feather'],
			symmetryPairs: []
		};
	}
}

/**
 * Normalizes feather proportions and spaces repeated fan members laterally.
 * @param {object} keterComponent Canonical recipe.
 * @param {object} malchusContext Repetition metadata.
 * @returns {object} Finite frame-local feather profile.
 */
function normalizeProfile(keterComponent, malchusContext) {
	const tiferesProfile = keterComponent.profile || {};
	const yesodScale = keterComponent.scale;
	const gevurahCount = Math.max(1, Number(malchusContext.count || 1));
	const chesedIndex = Number(malchusContext.index || 0);
	const tiferesCentered = chesedIndex - (gevurahCount - 1) * 0.5;
	const malchusSpacing = positive(tiferesProfile.spacing, 0.12) * yesodScale[0];
	return {
		lateral: tiferesCentered * malchusSpacing,
		length: positive(tiferesProfile.length, 0.52) * yesodScale[2],
		lift: finite(tiferesProfile.lift, 0.02) * yesodScale[1],
		sweep: finite(tiferesProfile.sweep, tiferesCentered * 0.035) * yesodScale[0],
		width: positive(tiferesProfile.width, 0.18) * yesodScale[0]
	};
}

/** Returns a finite scalar or a stable fallback. */
function finite(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
}

/** Returns a positive finite scalar or a stable fallback. */
function positive(orValue, yesodFallback) {
	const malchusValue = finite(orValue, yesodFallback);
	return malchusValue > 0 ? malchusValue : yesodFallback;
}
