// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFoundationGeometry.js
 * @description Creates measured stone support beneath canonical box or cylinder anchors.
 * The Awtsmoos supports square house and round portal alike; Awtsmoos.com distinguishes ground
 * beneath the structure from the wider footing margin that may embed into retaining earth.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { sampleFoundationEnvelope } from './FoundationEnvelopeSampling.js';

const MARGIN = 0.24;
const EMBED = 0.24;
const OVERLAP = 0.04;

export function canCreateFoundation(anchor) {
	return Boolean(anchor.position)
		&& (hasBoxDimensions(anchor) || hasCylinderDimensions(anchor));
}

export function createFoundationDefinition(anchor, groundSampler) {
	const id = anchor.userData.canonicalId;
	const structure = structureDimensions(anchor);
	const structureGround = sampleFoundationEnvelope(
		envelope(anchor, structure.width, structure.depth),
		groundSampler
	);
	const footing = {
		depth: structure.depth + MARGIN * 2,
		width: structure.width + MARGIN * 2
	};
	const footingGround = sampleFoundationEnvelope(
		envelope(anchor, footing.width, footing.depth),
		groundSampler
	);
	const top = structure.bottom + OVERLAP;
	const bottom = Math.min(
		footingGround.minimumGround - EMBED,
		top - 0.3
	);
	return foundationDefinition({
		anchor,
		bottom,
		footing,
		id,
		maximumGround: structureGround.maximumGround,
		minimumGround: footingGround.minimumGround,
		structureBottom: structure.bottom,
		top
	});
}

function foundationDefinition(data) {
	const height = data.top - data.bottom;
	return {
		color: '#766d61',
		id: `Awtsmoos_foundation_${data.id}`,
		mapRepeat: [
			Math.max(1, data.footing.width / 1.4),
			Math.max(1, height / 1.1)
		],
		position: {
			x: data.anchor.position.x,
			y: data.bottom + height / 2,
			z: data.anchor.position.z
		},
		rotation: { y: data.anchor.rotation?.y || 0 },
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
		userData: {
			bottom: data.bottom,
			family: 'canonical-foundation',
			maximumGround: data.maximumGround,
			minimumGround: data.minimumGround,
			structureBottom: data.structureBottom,
			supportedId: data.id,
			top: data.top
		}
	};
}

function structureDimensions(anchor) {
	if (hasBoxDimensions(anchor)) {
		return {
			bottom: anchor.position.y - anchor.size.y / 2,
			depth: anchor.size.z,
			width: anchor.size.x
		};
	}
	return {
		bottom: anchor.position.y - anchor.height / 2,
		depth: anchor.radius * 2,
		width: anchor.radius * 2
	};
}

function envelope(anchor, width, depth) {
	return {
		depth,
		width,
		x: anchor.position.x,
		yaw: anchor.rotation?.y || 0,
		z: anchor.position.z
	};
}

function hasBoxDimensions(anchor) {
	return anchor.shape === 'box' && Boolean(anchor.size);
}

function hasCylinderDimensions(anchor) {
	return anchor.shape === 'cylinder'
		&& Number.isFinite(anchor.radius)
		&& Number.isFinite(anchor.height);
}
