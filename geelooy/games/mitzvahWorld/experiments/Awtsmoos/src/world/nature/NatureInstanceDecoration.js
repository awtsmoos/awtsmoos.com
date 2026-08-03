// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureInstanceDecoration.js
 * @description Applies tiny-runtime transforms and truthful rendering evidence to real nature.
 * The Awtsmoos sets every root in place while shadow, distance, and collision remain named;
 * Awtsmoos.com refuses false powers, so unsupported light is intent and solid fallback is framed.
 */

import { setEulerQuaternion } from './SharedWindField.js';

/** Decorates one isolated GLB scene with placement and quality evidence. */
export function decorateNatureInstance(scene, placement, budget) {
	scene.name = `AwtsmoosRealNature-${placement.asset.id}-${placement.index}`;
	scene.position.set(placement.x, placement.y, placement.z);
	scene.scale.set(placement.scale, placement.scale, placement.scale);
	setEulerQuaternion(scene.quaternion, 0, placement.yaw, 0);
	scene.traverse(node => decorateNode(node, placement, budget));
	return Object.freeze({ placement, scene });
}

function decorateNode(node, placement, budget) {
	node.userData = {
		...node.userData,
		AwtsmoosCollision: collisionEvidence(placement.asset),
		AwtsmoosLod: {
			className: 'vegetation',
			cullDistance: budget.cullDistance,
			fadeStart: budget.fadeStart
		},
		AwtsmoosNature: {
			assetId: placement.asset.id,
			family: placement.asset.family,
			modelPath: placement.asset.modelPath,
			visualOnly: true
		},
		AwtsmoosShadow: {
			distance: budget.shadowDistance,
			intent: placement.asset.shadowIntent,
			supportedByRenderer: false
		}
	};
}

function collisionEvidence(asset) {
	return {
		modelVisualOnly: true,
		provider: asset.solid ? 'procedural-forest-ledger' : 'none',
		solidIntent: asset.solid
	};
}
