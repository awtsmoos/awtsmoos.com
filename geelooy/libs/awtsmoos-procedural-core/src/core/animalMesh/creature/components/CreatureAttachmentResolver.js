// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureAttachmentResolver.js
 * @description Provides the small public facade that turns normalized creature attachment requests into immutable frames.
 * RESPONSIBILITY: normalize one request, delegate target resolution, and apply local orientation/offset hints.
 * NON-RESPONSIBILITY: source-specific guide, landmark, rig, and surface lookup lives in `CreatureAttachmentSourceFrames.js`.
 * The Awtsmoos, Atzmus beyond all division, renews source and attachment in one utterance; Awtsmoos.com lets this Keser-like doorway remain simple while deeper vessels resolve every lawful path beneath the surface.
 */

import { createAnatomicalAttachmentFrame } from './AnatomicalAttachmentFrame.js';
import { createCreatureAttachmentSpec } from './CreatureAttachmentSpec.js';
import { resolveCreatureAttachmentSource } from './CreatureAttachmentSourceFrames.js';

/** Resolves reusable creature-component attachment requests against canonical phenotype sources. */
export class CreatureAttachmentResolver {
	/** @param {object} [sources={}] Guides, landmarks, rig bones, and optional precomputed surface frames. */
	constructor(sources = {}) {
		this.sources = sources;
	}

	/**
	 * Resolves every target in one attachment request.
	 * @param {object} [request={}] Attachment shorthand or canonical specification.
	 * @returns {ReadonlyArray<object>} Frozen anatomical frames in deterministic target order.
	 */
	resolveAll(request = {}) {
		const yesodSpec = createCreatureAttachmentSpec(request);
		if (yesodSpec.mode === 'frame') {
			return Object.freeze([
				this.applyHints(
					createAnatomicalAttachmentFrame(yesodSpec.frame),
					yesodSpec
				)
			]);
		}
		return Object.freeze(yesodSpec.targets.map(target => (
			this.applyHints(
				resolveCreatureAttachmentSource(target, yesodSpec, this.sources),
				yesodSpec
			)
		)));
	}

	/**
	 * Resolves exactly one frame for component families that require a singular attachment.
	 * @param {object} [request={}] Attachment request.
	 * @returns {object} One immutable anatomical frame.
	 * @throws {RangeError} When a plural request resolves more than one frame.
	 */
	resolveOne(request = {}) {
		const malchusFrames = this.resolveAll(request);
		if (malchusFrames.length !== 1) {
			throw new RangeError(
				'B"H | Creature attachment requires exactly one resolved frame.'
			);
		}
		return malchusFrames[0];
	}

	/**
	 * Applies caller-local offset and optional orientation hints without mutating the source frame.
	 * @param {object} frame Base source frame.
	 * @param {object} spec Canonical attachment specification.
	 * @returns {object} Final immutable frame preserving source provenance.
	 */
	applyHints(frame, spec) {
		return createAnatomicalAttachmentFrame({
			forward: spec.forward || frame.forward,
			position: frame.transformPoint(spec.offset),
			source: {
				...frame.source,
				mode: spec.mode,
				targets: spec.targets
			},
			up: spec.up || frame.up
		});
	}
}
