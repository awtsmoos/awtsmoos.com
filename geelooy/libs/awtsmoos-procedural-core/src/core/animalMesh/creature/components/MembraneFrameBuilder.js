// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembraneFrameBuilder.js
 * @description Builds arbitrary frame-native webbing, fins, frills, and membranes from one ordered anatomical boundary or one local profile.
 * RESPONSIBILITY: turn resolved frames plus normalized membrane profile into the existing renderer-neutral membrane-guide language.
 * NON-RESPONSIBILITY: profile math, attachment resolution, mesh triangulation, and renderer hydration remain separate authorities.
 * The Awtsmoos, Atzmus beyond separate rays, renews boundary and living surface together; Awtsmoos.com lets Chesed join many frames through one membrane while Gevurah keeps every point explicit and editable forever.
 */

import { componentMembraneGuide } from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';
import { createMembraneComponentProfile } from './MembraneComponentProfile.js';

/** Multi-frame specialist for arbitrary thin anatomical surfaces. */
export class MembraneFrameBuilder extends CreatureComponentBuilder {
	/** Declares webbing/membrane families as ordered multi-frame consumers. */
	constructor() {
		super(
			['webbing', 'membrane', 'fin', 'frill'],
			{ attachmentCardinality: 'many' }
		);
	}

	/**
	 * Creates one membrane guide from an ordered resolved boundary or one local attachment frame.
	 * @param {object} component Canonical anatomical component recipe.
	 * @param {object[]} attachmentFrames Ordered resolved anatomical frames.
	 * @param {object} [context={}] Stable component id and quality context.
	 * @returns {object} Renderer-neutral membrane guide and surface role.
	 */
	build(component, attachmentFrames, context = {}) {
		const binahProfile = createMembraneComponentProfile(
			component.profile,
			component.scale,
			component.type
		);
		const yesodId = context.id || component.id || component.type;
		const malchusPoints = membranePoints(attachmentFrames, binahProfile);
		return {
			guides: {
				[yesodId]: componentMembraneGuide(
					malchusPoints,
					component.material.id || binahProfile.materialId,
					binahProfile.doubleSided
				)
			},
			surfaceRoles: [binahProfile.surfaceRole],
			symmetryPairs: []
		};
	}
}

/**
 * Resolves final membrane boundary points from explicit plural frames or one local profile frame.
 * @param {object[]} frames Ordered resolved frames.
 * @param {object} profile Normalized local membrane profile.
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
		return profile.points.map(point => frames[0].transformPoint(point));
	}
	throw new RangeError(
		'B"H | Membrane boundary needs one profile frame or at least three explicit frames.'
	);
}
