// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFoundationGeometry.js
 * @description Creates measured stone support beneath canonical architecture envelopes.
 * The Awtsmoos supports authored forms upon uneven earth; Awtsmoos.com raises each footing
 * above both the structure base and the highest enclosed ground so no mountain pierces home.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { resolveFoundationAnchorEnvelope } from './FoundationAnchorEnvelope.js';
import { sampleFoundationEnvelope } from './FoundationEnvelopeSampling.js';

const MARGIN = 0.24;
const EMBED = 0.24;
const OVERLAP = 0.04;

export function canCreateFoundation(anchor) {
	return Boolean(resolveFoundationAnchorEnvelope(anchor));
}

export function createFoundationDefinition(anchor, groundSampler) {
	const structure = resolveFoundationAnchorEnvelope(anchor);
	if (!structure) {
		throw new Error(`Unsupported foundation anchor ${anchor?.id || 'unknown'}.`);
	}
	const structureGround = sampleFoundationEnvelope(structure, groundSampler);
	const footing = {
		...structure,
		depth: structure.depth + MARGIN * 2,
		width: structure.width + MARGIN * 2
	};
	const footingGround = sampleFoundationEnvelope(footing, groundSampler);
	const top = Math.max(structure.bottom, structureGround.maximumGround) + OVERLAP;
	const bottom = Math.min(
		footingGround.minimumGround - EMBED,
		top - 0.3
	);
	return foundationDefinition({
		anchor,
		bottom,
		footing,
		maximumGround: structureGround.maximumGround,
		minimumGround: footingGround.minimumGround,
		structureBottom: structure.bottom,
		top
	});
}

function foundationDefinition(data) {
	const height = data.top - data.bottom;
	const id = data.anchor.userData.canonicalId;
	return {
		color: '#766d61',
		id: `Awtsmoos_foundation_${id}`,
		mapRepeat: [
			Math.max(1, data.footing.width / 1.4),
			Math.max(1, height / 1.1)
		],
		position: {
			x: data.footing.x,
			y: data.bottom + height / 2,
			z: data.footing.z
		},
		rotation: { y: data.footing.yaw },
		shape: 'box',
		size: {
			x: data.footing.width,
			y: height,
			z: data.footing.depth
		},
		solid: true,
		texturePolicy: {
			publicFirebase: true,
			role: 'canonical-retaining-foundation',
			shader: 'rough-stone-detail',
			tileWorld: 1.2
		},
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		userData: foundationMetadata(data, id)
	};
}

function foundationMetadata(data, id) {
	return {
		bottom: data.bottom,
		family: 'canonical-foundation',
		maximumGround: data.maximumGround,
		minimumGround: data.minimumGround,
		structureBottom: data.structureBottom,
		supportedId: id,
		top: data.top
	};
}
