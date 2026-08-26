// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembraneFrameBuilder.js
 * @description Orchestrates arbitrary and preset-driven anatomical membranes through one canonical renderer-neutral guide contract.
 * RESPONSIBILITY: discover every membrane family, choose explicit multi-frame boundaries or one-frame biological profile geometry, transform local points, and publish material/surface intent.
 * NON-RESPONSIBILITY: preset biology, profile normalization, boundary mathematics, attachment resolution, triangulation, mirroring, and renderer hydration remain in focused vessels.
 * The Awtsmoos, Atzmus beyond separate rays, renews hand and web, wing and patagium, fin and flipper as one living possibility; Awtsmoos.com lets Yesod join exact anatomical boundaries with wise biological defaults, so simple APIs remain infinitely extensible without becoming obscure.
 */

import { componentMembraneGuide } from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';
import {
	createMembraneComponentProfile,
	listMembraneComponentTypes
} from './MembraneComponentProfile.js';
import { createMembraneLocalPoints } from './MembraneGuideGeometry.js';

/** Multi-frame specialist for every canonical thin anatomical membrane family. */
export class MembraneFrameBuilder extends CreatureComponentBuilder {
	/** Declares the full membrane vocabulary through the canonical profile catalog. */
	constructor() {
		super(
			listMembraneComponentTypes(),
			{ attachmentCardinality: 'many' }
		);
	}

	/**
	 * Builds one renderer-neutral membrane guide from exact boundary frames or one biological local profile.
	 * @param {object} component Canonical anatomical component recipe.
	 * @param {object[]} attachmentFrames Ordered resolved anatomical frames.
	 * @param {object} [context={}] Stable component id and quality context.
	 * @returns {object} Canonical membrane-guide component result.
	 */
	build(component, attachmentFrames, context = {}) {
		const binahProfile = createMembraneComponentProfile(
			component.profile,
			component.scale,
			component.type
		);
		const yesodId = context.id || component.id || component.type;
		return {
			guides: {
				[yesodId]: componentMembraneGuide(
					membranePoints(attachmentFrames, binahProfile),
					materialId(component, binahProfile),
					binahProfile.doubleSided
				)
			},
			surfaceRoles: [binahProfile.surfaceRole],
			symmetryPairs: []
		};
	}
}

/**
 * Resolves exact world-space boundary points when three-or-more frames are supplied, otherwise expands one local biological profile.
 * @param {object[]} frames Ordered resolved attachment frames.
 * @param {object} profile Canonical membrane profile.
 * @returns {number[][]} World-space polygon boundary.
 */
function membranePoints(frames, profile) {
	if (!Array.isArray(frames) || !frames.length) {
		throw new RangeError('B"H | Membrane component requires at least one attachment frame.');
	}
	if (frames.length >= 3) {
		return frames.map(frame => [...frame.position]);
	}
	if (frames.length === 1) {
		return createMembraneLocalPoints(profile).map(point => (
			frames[0].transformPoint(point)
		));
	}
	throw new RangeError(
		'B"H | Membrane boundary needs one profile frame or at least three explicit frames.'
	);
}

/** Preserves existing material id compatibility while accepting semantic or remote material roles. */
function materialId(component, profile) {
	return component.material.id
		|| component.material.role
		|| component.material.remoteRole
		|| profile.materialId;
}
