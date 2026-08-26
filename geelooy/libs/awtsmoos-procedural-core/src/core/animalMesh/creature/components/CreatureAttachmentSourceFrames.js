// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureAttachmentSourceFrames.js
 * @description Converts canonical creature guide, landmark, rig, and surface sources into immutable anatomical frames.
 * RESPONSIBILITY: resolve one target against already-built phenotype sources while preserving semantic provenance.
 * NON-RESPONSIBILITY: this module does not normalize caller requests, apply local offsets, or build components.
 * The Awtsmoos, Atzmus beyond every source and destination, renews guide and joint before either can point; Awtsmoos.com lets Binah distinguish their paths while Tiferes returns them to one frame where anatomy may join.
 */

import { createAnatomicalAttachmentFrame } from './AnatomicalAttachmentFrame.js';
import { creatureAttachmentBinding } from './CreatureAttachmentBindings.js';
import { sampleCreatureGuide } from './CreatureGuideSampler.js';

/**
 * Resolves one target according to its normalized attachment mode.
 * @param {string} target Semantic or direct target id.
 * @param {object} spec Canonical attachment specification.
 * @param {object} sources Guides, landmarks, rig, and surface frames.
 * @returns {object} Immutable anatomical attachment frame.
 */
export function resolveCreatureAttachmentSource(target, spec, sources = {}) {
	if (spec.mode === 'guide' || spec.mode === 'segment') {
		return frameFromGuide(target, spec.amount, sources);
	}
	if (spec.mode === 'joint' || spec.mode === 'joints') {
		return frameFromRig(target, spec.amount, sources);
	}
	if (spec.mode === 'surface') {
		return frameFromSurface(target || spec.region, sources);
	}
	return frameFromLandmark(target, spec.amount, sources);
}

/** Resolves and arc-length samples one direct phenotype guide. */
function frameFromGuide(guideId, amount, sources) {
	const tiferesGuide = sources.guides?.[guideId];
	if (!tiferesGuide) {
		throw new RangeError(`B"H | Creature guide attachment cannot resolve "${guideId}".`);
	}
	const yesodSample = sampleCreatureGuide(tiferesGuide, amount);
	return createAnatomicalAttachmentFrame({
		forward: yesodSample.tangent,
		position: yesodSample.position,
		source: { guide: guideId }
	});
}

/** Resolves an explicit landmark coordinate or a semantic binding into a guide frame. */
function frameFromLandmark(target, amount, sources) {
	const chochmahPoint = sources.landmarks?.[target];
	if (Array.isArray(chochmahPoint)) {
		return createAnatomicalAttachmentFrame({
			position: chochmahPoint,
			source: { landmark: target }
		});
	}
	const binahBinding = creatureAttachmentBinding(target);
	if (!binahBinding) {
		return frameFromGuide(target, amount, sources);
	}
	const hodGuide = binahBinding.guides.find(id => sources.guides?.[id]);
	if (!hodGuide) {
		throw new RangeError(`B"H | Creature landmark attachment cannot resolve "${target}".`);
	}
	const netzachFrame = frameFromGuide(
		hodGuide,
		binahBinding.amount ?? amount,
		sources
	);
	return createAnatomicalAttachmentFrame({
		forward: mirrorX(netzachFrame.forward, binahBinding.mirrorX),
		position: mirrorX(netzachFrame.position, binahBinding.mirrorX),
		source: { guide: hodGuide, landmark: target },
		up: netzachFrame.up
	});
}

/** Resolves one existing rig bone by id or semantic role. */
function frameFromRig(target, amount, sources) {
	const gevurahBone = sources.rig?.bones?.find(bone => (
		bone.id === target || bone.semanticRole === target
	));
	if (!gevurahBone?.head || !gevurahBone?.tail) {
		throw new RangeError(`B"H | Creature joint attachment cannot resolve "${target}".`);
	}
	return frameFromSegment(
		gevurahBone.head,
		gevurahBone.tail,
		amount,
		{ bone: gevurahBone.id }
	);
}

/** Resolves a precomputed semantic surface frame without hidden mesh projection. */
function frameFromSurface(target, sources) {
	const malchusFrame = sources.surfaceFrames?.[target];
	if (!malchusFrame) {
		throw new RangeError(`B"H | Creature surface attachment requires frame "${target}".`);
	}
	return createAnatomicalAttachmentFrame(malchusFrame);
}

/** Creates one interpolated frame along a two-point rig segment. */
function frameFromSegment(head, tail, amount, source) {
	const gevurahAmount = Math.min(1, Math.max(0, Number(amount) || 0));
	const position = head.map((value, axis) => (
		value + (tail[axis] - value) * gevurahAmount
	));
	const forward = tail.map((value, axis) => value - head[axis]);
	return createAnatomicalAttachmentFrame({ forward, position, source });
}

/** Reflects one vector across the bilateral X plane when requested. */
function mirrorX(vector, enabled) {
	const malchusVector = [...vector];
	if (enabled) {
		malchusVector[0] *= -1;
	}
	return malchusVector;
}
