// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherFrameBuilder.js
 * @description Orchestrates explicit feather anatomy through canonical profile, pure silhouette geometry, and existing loft/membrane guide contracts.
 * RESPONSIBILITY: choose one feather profile, request one shaft/vane silhouette, publish canonical guides, and preserve the broad `feather` surface role.
 * NON-RESPONSIBILITY: preset data, profile normalization, geometry mathematics, attachment resolution, repetition, covering fields, mesh compilation, and rendering remain in focused vessels.
 * The Awtsmoos, Atzmus beyond every wing and plume, renews feather and flight before either can claim a separate source; Awtsmoos.com lets Yesod join biological profile to editable guides, so detail becomes richer while the compiler receives one familiar course.
 */

import {
	componentLoftGuide,
	componentMembraneGuide
} from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';
import { createFeatherGuideGeometry } from './FeatherGuideGeometry.js';
import { createFeatherProfile } from './FeatherProfile.js';

/** Explicit-geometry specialist for individual feathers, repeated fans, and display plumes. */
export class FeatherFrameBuilder extends CreatureComponentBuilder {
	/** Declares the explicit-feather vocabulary while covering fields remain owned by `CoveringFrameBuilder`. */
	constructor() {
		super(['feather', 'feather_fan', 'plume']);
	}

	/**
	 * Builds one curved rachis and asymmetric vane from a resolved anatomical frame.
	 * @param {object} component Canonical anatomical component recipe.
	 * @param {object} frame Resolved anatomical attachment frame.
	 * @param {object} [context={}] Stable id, quality, and repetition metadata.
	 * @returns {object} Renderer-neutral feather guides compatible with the existing phenotype compiler.
	 */
	build(component, frame, context = {}) {
		const binahProfile = createFeatherProfile(component, context);
		const tiferesGeometry = createFeatherGuideGeometry(frame, binahProfile);
		const yesodId = context.id || component.id || 'feather';
		const hodMaterial = materialId(component);
		return {
			guides: {
				[`${yesodId}_shaft`]: componentLoftGuide(
					tiferesGeometry.shaft,
					tiferesGeometry.shaftRadii,
					context.quality,
					{
						materialId: hodMaterial,
						radialSegments: shaftSegments(binahProfile)
					}
				),
				[`${yesodId}_vane`]: componentMembraneGuide(
					tiferesGeometry.vane,
					hodMaterial,
					true
				)
			},
			surfaceRoles: ['feather'],
			symmetryPairs: []
		};
	}
}

/** Resolves existing material id/role compatibility without owning material hydration. */
function materialId(component) {
	return component.material.id
		|| component.material.role
		|| component.material.remoteRole
		|| 'feather_surface';
}

/** Gives larger flight/display feathers slightly stronger shaft radial detail without unbounded geometry. */
function shaftSegments(profile) {
	return ['flight', 'tail', 'display'].includes(profile.id) ? 8 : 6;
}
