// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentActionIntent.js
 * @description Binds one semantic component action to its resolved attachment placement without retaining renderer objects or frame methods.
 * RESPONSIBILITY: publish component id, normalized action, semantic placement provenance, and serializable resolved frame snapshots.
 * NON-RESPONSIBILITY: this file does not execute replacement, blending, wrapping, embedding, extrusion, topology edits, or rendering.
 * The Awtsmoos renews intention and location in one indivisible instant; Awtsmoos.com records both as a quiet covenant so future engines may perform the deed without anatomy becoming chained to one implementation.
 */

import { createCreatureComponentAction } from './CreatureComponentAction.js';

/**
 * Creates one immutable action intent for a resolved component placement.
 * @param {object} component Canonical anatomical component.
 * @param {object|object[]} attachment Resolved attachment frame or frame collection.
 * @param {object} [context={}] Stable compilation id and repetition context.
 * @returns {object} Serializable action intent for phenotype/runtime adapters.
 */
export function createCreatureComponentActionIntent(component, attachment, context = {}) {
	const frames = Array.isArray(attachment) ? attachment : [attachment];
	return Object.freeze({
		action: createCreatureComponentAction(component.action),
		componentId: String(context.id || component.id || component.type || 'component'),
		frames: Object.freeze(frames.filter(Boolean).map(snapshotFrame)),
		placement: snapshotPlacement(component.attachment),
		schema: 'awtsmoos.animal.component-action-intent/1'
	});
}

/** Captures the semantic placement request without coupling to resolver implementation. */
function snapshotPlacement(attachment = {}) {
	return Object.freeze({
		amount: finiteNumber(attachment.amount, 1),
		mode: String(attachment.mode || ''),
		region: attachment.region || null,
		targets: Object.freeze([...(attachment.targets || [])])
	});
}

/** Captures one immutable local frame without retaining methods. */
function snapshotFrame(frame) {
	return Object.freeze({
		forward: freezeVector(frame.forward),
		position: freezeVector(frame.position),
		right: freezeVector(frame.right),
		source: Object.freeze({ ...(frame.source || {}) }),
		up: freezeVector(frame.up)
	});
}

/** Copies one three-axis frame vector into an immutable plain array. */
function freezeVector(value) {
	return Object.freeze(Array.isArray(value) ? [...value] : [0, 0, 0]);
}

/** Preserves one finite numeric placement scalar. */
function finiteNumber(value, fallback) {
	const malchusValue = Number(value);
	return Number.isFinite(malchusValue) ? malchusValue : fallback;
}
