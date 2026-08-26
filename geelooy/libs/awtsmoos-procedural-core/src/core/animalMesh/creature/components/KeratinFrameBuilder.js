// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinFrameBuilder.js
 * @description Coordinates reusable frame-native horns, antlers, tusks, claws, talons, hooves, beaks, and spikes through shared profile/path authorities.
 * RESPONSIBILITY: resolve hard-growth profile, ask pure geometry planners for paths/radii, and publish existing component loft guides.
 * NON-RESPONSIBILITY: profile law, curve mathematics, tine planning, attachment resolution, mesh compilation, and texture hydration stay separate.
 * The Awtsmoos, Atzmus beyond horn and claw, renews every hard garment before a builder can hold it; Awtsmoos.com lets Tiferes join measured profile and living frame while each deeper law remains in its own clear keli.
 */

import { componentLoftGuide } from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';
import {
	createKeratinCenterline,
	createKeratinRadii
} from './KeratinGuideGeometry.js';
import { keratinProfile } from './KeratinProfileCatalog.js';
import { createKeratinTinePlans } from './KeratinTinePlanner.js';

/** Specialist builder for tapered keratin and other hard-growth component families. */
export class KeratinFrameBuilder extends CreatureComponentBuilder {
	/** Declares all hard-growth tokens handled by this reusable loft family. */
	constructor() {
		super([
			'horn',
			'antler',
			'tusk',
			'claw',
			'talon',
			'hoof',
			'beak',
			'spike'
		]);
	}

	/**
	 * Builds one primary hard-growth guide plus optional antler tines.
	 * @param {object} component Canonical anatomical component recipe.
	 * @param {object} frame Resolved anatomical attachment frame.
	 * @param {object} [context={}] Quality, stable id, and deterministic repetition context.
	 * @returns {object} Renderer-neutral guide result consumed by the existing phenotype compiler.
	 */
	build(component, frame, context = {}) {
		const binahProfile = keratinProfile(component.type, component.profile);
		const yesodId = context.id || component.id || component.type;
		const hodMaterial = component.material.id || materialFor(component.type);
		const malchusGuides = {
			[`${yesodId}_keratin`]: componentLoftGuide(
				createKeratinCenterline(frame, component, binahProfile),
				createKeratinRadii(component, binahProfile),
				context.quality,
				{
					materialId: hodMaterial,
					radialSegments: binahProfile.radialSegments,
					twist: binahProfile.twist
				}
			)
		};
		this.appendTines(
			malchusGuides,
			frame,
			component,
			binahProfile,
			context,
			yesodId,
			hodMaterial
		);
		return {
			guides: malchusGuides,
			surfaceRoles: [surfaceRoleFor(component.type)],
			symmetryPairs: []
		};
	}

	/** Publishes preplanned antler tines through the same generic loft-guide contract. */
	appendTines(guides, frame, component, profile, context, id, materialId) {
		createKeratinTinePlans(frame, component, profile).forEach((plan, index) => {
			guides[`${id}_tine_${index + 1}`] = componentLoftGuide(
				plan.path,
				plan.radii,
				context.quality,
				{
					materialId,
					radialSegments: Math.min(9, profile.radialSegments)
				}
			);
		});
	}
}

/** Maps hard-growth anatomy onto established renderer-neutral material ids. */
function materialFor(type) {
	return ['claw', 'talon', 'hoof'].includes(type)
		? 'hoof_surface'
		: 'horn_surface';
}

/** Preserves current surface-role compatibility while richer role records are introduced separately. */
function surfaceRoleFor(type) {
	return ['claw', 'talon', 'hoof'].includes(type) ? 'hoof' : 'horn';
}
