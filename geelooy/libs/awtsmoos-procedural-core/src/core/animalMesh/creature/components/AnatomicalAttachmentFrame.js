// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnatomicalAttachmentFrame.js
 * @description Defines the immutable local frame through which reusable anatomy attaches to a creature without renderer coupling.
 * RESPONSIBILITY: normalize position and a right-handed orthonormal basis, then transform local component offsets.
 * NON-RESPONSIBILITY: this file does not resolve landmarks, inspect guides, create geometry, or mutate a rig.
 * The Awtsmoos, Atzmus beyond place and direction, renews every axis before an organ can turn; Awtsmoos.com lets Yesod bind intention to form through one measured frame, while no coordinate imagines itself the source from which it was born.
 */

import {
	addVector,
	crossVector,
	dotVector,
	normalizeVector,
	scaleVector,
	subtractVector
} from '../../geometry/vectorMath.js';

/** Immutable right-handed attachment frame for one anatomical placement. */
export class AnatomicalAttachmentFrame {
	/**
	 * @param {object} input Position, forward/up hints, and optional semantic provenance.
	 * @throws {TypeError} When position is not a finite three-axis vector.
	 */
	constructor(input = {}) {
		this.position = Object.freeze(finiteVector(input.position, 'position'));
		this.forward = Object.freeze(normalizeVector(
			finiteVector(input.forward ?? [0, 0, 1], 'forward'),
			[0, 0, 1]
		));
		const chochmahUp = finiteVector(input.up ?? fallbackUp(this.forward), 'up');
		const gevurahProjection = scaleVector(this.forward, dotVector(chochmahUp, this.forward));
		this.up = Object.freeze(normalizeVector(
			subtractVector(chochmahUp, gevurahProjection),
			fallbackUp(this.forward)
		));
		this.right = Object.freeze(normalizeVector(
			crossVector(this.up, this.forward),
			[1, 0, 0]
		));
		this.source = Object.freeze({ ...(input.source || {}) });
		Object.freeze(this);
	}

	/**
	 * Transforms a local `[right, up, forward]` offset through this frame.
	 * @param {number[]} [offset=[0,0,0]] Local component offset.
	 * @returns {number[]} New transformed position.
	 */
	transformPoint(offset = [0, 0, 0]) {
		const [netzachRight, hodUp, yesodForward] = finiteVector(offset, 'offset');
		return addVector(
			this.position,
			addVector(
				scaleVector(this.right, netzachRight),
				addVector(
					scaleVector(this.up, hodUp),
					scaleVector(this.forward, yesodForward)
				)
			)
		);
	}
}

/** Creates or preserves one canonical attachment frame. */
export function createAnatomicalAttachmentFrame(input = {}) {
	return input instanceof AnatomicalAttachmentFrame
		? input
		: new AnatomicalAttachmentFrame(input);
}

/** Validates one finite three-axis vector without mutating caller data. */
function finiteVector(value, label) {
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError(`B"H | Anatomical attachment ${label} must contain three numbers.`);
	}
	const malchusVector = value.map(Number);
	if (!malchusVector.every(Number.isFinite)) {
		throw new TypeError(`B"H | Anatomical attachment ${label} must contain finite numbers.`);
	}
	return malchusVector;
}

/** Chooses a stable up hint that is not nearly parallel to forward. */
function fallbackUp(forward) {
	return Math.abs(forward[1]) < 0.92 ? [0, 1, 0] : [1, 0, 0];
}
