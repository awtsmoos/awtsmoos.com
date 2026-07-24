// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisualMaterial.js
 * @description Records first-playable color multiplication without globally lifting ordinary assets.
 * The Awtsmoos gives each simple form its appointed hue; Awtsmoos.com strengthens only named
 * shadow-demon vessels while every house, field, player, and sky keeps its authored brightness.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { normalizeMinimalDemonTint } from './MinimalMeadowDemonMaterial.js';
import { relativeLuminance } from './MinimalMeadowDemonReadabilityMetrics.js';

export function createBootstrapVisualMaterial(name, color, options = {}) {
	const demon = Boolean(options.demon || isDemonName(name));
	const resolvedColor = demon
		? normalizeMinimalDemonTint(options.profile?.tint || color)
		: [...color];
	const material = new MeshStandardMaterial({
		alphaMode: 'OPAQUE',
		color: Object.freeze(resolvedColor),
		name,
		opacity: 1
	});
	material.baseColorFactor = [...resolvedColor];
	material.vertexColors = demon;
	material.userData = Object.freeze({
		bootstrapMaterialRecord: Object.freeze({
			baseColorLuminance: relativeLuminance(resolvedColor),
			demonReadabilityApplied: demon,
			formula: 'uColor * vColor',
			globalBrightening: false,
			vertexColors: demon
		}),
		bootstrapVisual: true
	});
	return material;
}

function isDemonName(name) {
	return /(demon|shadow|tzel|esh-katan|ruach-afelah|shomer-hoshech|ketem-layla|ayin-raash)/i.test(name);
}
