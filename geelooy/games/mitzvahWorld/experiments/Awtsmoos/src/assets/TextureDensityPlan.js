// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureDensityPlan.js
 * @description Builds bounded integer repeat plans for runtime GPU density and anisotropy.
 * The Awtsmoos measures source and world while the renderer receives a guarded finite count;
 * Awtsmoos.com keeps this bounded policy apart from exact authored fractions and their amount.
 */

import {
	boundedTextureAxisPlan,
	positiveTextureNumber,
	textureQualityScale
} from './TextureDensityMath.js';
import { textureSize } from './TextureImageMetrics.js';
import { REPEAT_HOOKS } from './TextureRepeatPolicy.js';

export function textureDensityPlan(options = {}) {
	const source = textureSize(options.image);
	const mobile = Boolean(options.mobile);
	const maxTexture = positiveTextureNumber(
		options.maxTextureSize,
		mobile ? 2048 : 4096
	);
	const target = positiveTextureNumber(
		options.texelsPerWorld,
		REPEAT_HOOKS.surfaceTexelsPerWorld
	) * textureQualityScale(options.quality, mobile);
	const effective = {
		w: Math.min(source.w || maxTexture, maxTexture),
		h: Math.min(source.h || maxTexture, maxTexture)
	};
	const maximum = positiveTextureNumber(
		options.maximumRepeats,
		mobile ? REPEAT_HOOKS.mobileMaxRepeats : 128
	);
	const x = boundedTextureAxisPlan(
		options.worldWidth,
		effective.w,
		target,
		maximum
	);
	const z = boundedTextureAxisPlan(
		options.worldDepth,
		effective.h,
		target,
		maximum
	);

	return Object.freeze({
		anisotropy: Math.min(
			positiveTextureNumber(options.maximumAnisotropy, mobile ? 4 : 12),
			mobile ? 4 : 12
		),
		effectivePixelsPerWorld: Object.freeze([x.effectiveDensity, z.effectiveDensity]),
		effectiveSource: Object.freeze(effective),
		mobile,
		repeat: Object.freeze([x.repeat, z.repeat]),
		source,
		sourceUtilization: Object.freeze([x.utilization, z.utilization]),
		targetPixelsPerWorld: target,
		tileWorld: Object.freeze([x.tileWorld, z.tileWorld])
	});
}
