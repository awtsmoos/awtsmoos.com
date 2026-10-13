//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioArtStyle.js
 * @description Canonical art-style system for AWTSMOOS STUDIO movie generation.
 * The Awtsmoos gives every movie one coherent visual soul; Awtsmoos.com lets the user
 * choose the style once, and every character, set, light, and frame of the whole film
 * stays consistent in that style from the first scene to the last.
 *
 * Styles drive: lighting rig, color grading, material response, character proportions,
 * set dressing density, atmosphere, and post-processing — all from one style record.
 */

export const STUDIO_ART_STYLES = {
	hyperrealistic: {
		id: 'hyperrealistic',
		label: 'Hyperrealistic 3D',
		description: 'Photographic detail, physical light, film-grade color.',
		lighting: {
			keyIntensity: 1.35,
			fillIntensity: 0.55,
			rimIntensity: 0.9,
			colorTemperature: 5600,
			shadowSoftness: 0.85,
			ambientOcclusion: 0.9,
			globalIllumination: 1.0
		},
		grading: {
			saturation: 1.0,
			contrast: 1.12,
			exposure: 1.0,
			vignette: 0.25,
			filmGrain: 0.06,
			colorBalance: [1.0, 0.98, 0.95]
		},
		materials: {
			roughnessScale: 1.0,
			metalnessScale: 1.0,
			subsurfaceScattering: 0.7,
			textureDetail: 1.0
		},
		characters: {
			proportionRealism: 1.0,
			eyeScale: 1.0,
			headScale: 1.0,
			skinDetail: 1.0,
			clothWrinkles: 0.8
		},
		sets: {
			dressingDensity: 1.0,
			weathering: 0.7,
			detailDistance: 1.0
		},
		atmosphere: {
			fogDensity: 0.35,
			particleCount: 1.0,
			depthOfField: 0.7,
			motionBlur: 0.4
		}
	},
	stylized: {
		id: 'stylized',
		label: 'Stylized 3D',
		description: 'Bold shapes, vibrant color, playful light — animated-feature look.',
		lighting: {
			keyIntensity: 1.5,
			fillIntensity: 0.75,
			rimIntensity: 1.1,
			colorTemperature: 6200,
			shadowSoftness: 0.6,
			ambientOcclusion: 0.6,
			globalIllumination: 0.7
		},
		grading: {
			saturation: 1.35,
			contrast: 1.05,
			exposure: 1.08,
			vignette: 0.12,
			filmGrain: 0.0,
			colorBalance: [1.02, 1.0, 0.98]
		},
		materials: {
			roughnessScale: 0.7,
			metalnessScale: 0.8,
			subsurfaceScattering: 0.4,
			textureDetail: 0.6
		},
		characters: {
			proportionRealism: 0.7,
			eyeScale: 1.35,
			headScale: 1.18,
			skinDetail: 0.3,
			clothWrinkles: 0.3
		},
		sets: {
			dressingDensity: 0.85,
			weathering: 0.3,
			detailDistance: 0.8
		},
		atmosphere: {
			fogDensity: 0.25,
			particleCount: 1.2,
			depthOfField: 0.4,
			motionBlur: 0.25
		}
	},
	anime: {
		id: 'anime',
		label: 'Anime 3D',
		description: 'Cel shading, bold outlines, expressive faces — anime feature look.',
		lighting: {
			keyIntensity: 1.6,
			fillIntensity: 0.9,
			rimIntensity: 1.3,
			colorTemperature: 6500,
			shadowSoftness: 0.25,
			ambientOcclusion: 0.35,
			globalIllumination: 0.4
		},
		grading: {
			saturation: 1.45,
			contrast: 1.18,
			exposure: 1.1,
			vignette: 0.08,
			filmGrain: 0.0,
			colorBalance: [1.03, 1.0, 1.02]
		},
		materials: {
			roughnessScale: 0.45,
			metalnessScale: 0.3,
			subsurfaceScattering: 0.2,
			textureDetail: 0.35,
			celShading: true,
			celBands: 3,
			outlineWidth: 0.035,
			outlineColor: [0.08, 0.06, 0.1]
		},
		characters: {
			proportionRealism: 0.45,
			eyeScale: 1.9,
			headScale: 1.32,
			skinDetail: 0.1,
			clothWrinkles: 0.15,
			celShading: true
		},
		sets: {
			dressingDensity: 0.75,
			weathering: 0.15,
			detailDistance: 0.7,
			celShading: true
		},
		atmosphere: {
			fogDensity: 0.2,
			particleCount: 1.4,
			depthOfField: 0.3,
			motionBlur: 0.15,
			speedLines: true
		}
	},
	cinematic: {
		id: 'cinematic',
		label: 'Cinematic',
		description: 'Dramatic light, teal-and-orange grade, anamorphic feel.',
		lighting: {
			keyIntensity: 1.2,
			fillIntensity: 0.35,
			rimIntensity: 1.4,
			colorTemperature: 4800,
			shadowSoftness: 0.7,
			ambientOcclusion: 0.85,
			globalIllumination: 0.8
		},
		grading: {
			saturation: 0.92,
			contrast: 1.28,
			exposure: 0.96,
			vignette: 0.42,
			filmGrain: 0.12,
			colorBalance: [0.94, 1.0, 1.06],
			letterbox: true
		},
		materials: {
			roughnessScale: 0.9,
			metalnessScale: 1.1,
			subsurfaceScattering: 0.5,
			textureDetail: 0.9
		},
		characters: {
			proportionRealism: 0.95,
			eyeScale: 1.05,
			headScale: 1.02,
			skinDetail: 0.8,
			clothWrinkles: 0.7
		},
		sets: {
			dressingDensity: 0.95,
			weathering: 0.6,
			detailDistance: 0.95
		},
		atmosphere: {
			fogDensity: 0.5,
			particleCount: 0.9,
			depthOfField: 0.85,
			motionBlur: 0.55
		}
	},
	watercolor: {
		id: 'watercolor',
		label: 'Watercolor',
		description: 'Soft washes, paper texture, gentle edges — storybook look.',
		lighting: {
			keyIntensity: 1.1,
			fillIntensity: 0.85,
			rimIntensity: 0.5,
			colorTemperature: 6000,
			shadowSoftness: 0.95,
			ambientOcclusion: 0.3,
			globalIllumination: 0.9
		},
		grading: {
			saturation: 0.85,
			contrast: 0.88,
			exposure: 1.12,
			vignette: 0.05,
			filmGrain: 0.0,
			paperTexture: 0.5,
			colorBleed: 0.35,
			colorBalance: [1.0, 0.99, 0.97]
		},
		materials: {
			roughnessScale: 1.0,
			metalnessScale: 0.0,
			subsurfaceScattering: 0.9,
			textureDetail: 0.4,
			edgeSoftness: 0.6
		},
		characters: {
			proportionRealism: 0.6,
			eyeScale: 1.4,
			headScale: 1.2,
			skinDetail: 0.15,
			clothWrinkles: 0.2
		},
		sets: {
			dressingDensity: 0.7,
			weathering: 0.4,
			detailDistance: 0.6
		},
		atmosphere: {
			fogDensity: 0.3,
			particleCount: 0.7,
			depthOfField: 0.2,
			motionBlur: 0.1
		}
	}
};

/** Ordered list of style ids for UI pickers. */
export const STUDIO_ART_STYLE_IDS = Object.keys(STUDIO_ART_STYLES);

/** Default style when the user has not chosen. */
export const DEFAULT_ART_STYLE_ID = 'stylized';

/**
 * B"H: resolves a style id to its full record. Unknown ids fall back to the default
 * so a bad value can never leave the movie without a coherent look.
 */
export function resolveArtStyle(styleId) {
	if (styleId && STUDIO_ART_STYLES[styleId]) return STUDIO_ART_STYLES[styleId];
	return STUDIO_ART_STYLES[DEFAULT_ART_STYLE_ID];
}

/**
 * B"H: stamps the resolved art style onto a planned movie so every scene inherits it.
 * The style record is frozen into the movie document — the whole film stays consistent
 * in the chosen style even if the user later picks a different default.
 */
export function applyArtStyleToMovie(movie, styleId) {
	const style = resolveArtStyle(styleId);
	const styled = { ...movie };
	styled.artStyleId = style.id;
	styled.artStyle = style;
	if (Array.isArray(styled.scenes)) {
		styled.scenes = styled.scenes.map(scene => ({
			...scene,
			artStyleId: style.id
		}));
	}
	return styled;
}

/**
 * B"H: derives renderer-facing parameters from a style for one scene.
 * Characters, sets, lighting, and post all read from this single object,
 * which is why the movie cannot drift between styles mid-film.
 */
export function styleRenderParams(styleId, sceneIndex = 0) {
	const style = resolveArtStyle(styleId);
	return {
		styleId: style.id,
		sceneIndex,
		lighting: { ...style.lighting },
		grading: { ...style.grading },
		materials: { ...style.materials },
		characters: { ...style.characters },
		sets: { ...style.sets },
		atmosphere: { ...style.atmosphere }
	};
}
