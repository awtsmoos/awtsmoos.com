//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieSemanticKinds.js
 * @description The Awtsmoos is beyond every category, yet Awtsmoos.com names
 * visual, spatial, sonic, textual, data, framing, and transition vessels so AI intent can keep its cinematic flame.
 */
export const MovieLayerKind = Object.freeze({
	SHAPE_2D: "shape2d",
	TEXT: "text",
	PATH_2D: "path2d",
	CHART: "chart",
	PARTICLES_2D: "particles2d",
	CHARACTER_2D: "character2d",
	GROUP_2D: "group2d",
	MODEL_3D: "model3d",
	CHARACTER_3D: "character3d",
	PARTICLES_3D: "particles3d",
	LIGHT_3D: "light3d",
	WORLD_3D: "world3d",
	GROUP_3D: "group3d",
	OVERLAY: "overlay",
	IMAGE: "image",
	VIDEO: "video",
	AUDIO: "audio",
	DIALOGUE: "dialogue",
	NARRATION: "narration",
	MUSIC: "music",
	AMBIENCE: "ambience",
	SFX: "sfx",
	CAPTION: "caption",
	MASK: "mask",
	MATTE: "matte",
	ADJUSTMENT: "adjustment",
	CAMERA: "camera",
	DATA: "data",
	DIAGRAM: "diagram",
	CODE: "code",
	FORMULA: "formula",
	DEVICE: "device"
});

export const MovieCameraKind = Object.freeze({
	WIDE: "wide",
	MEDIUM: "medium",
	TWO_SHOT: "two-shot",
	CLOSEUP: "closeup",
	EXTREME_CLOSEUP: "extreme-closeup",
	OVERHEAD: "overhead",
	LOW_ANGLE: "low-angle",
	HIGH_ANGLE: "high-angle",
	POV: "pov",
	ORBIT: "orbit",
	DOLLY: "dolly",
	CRANE: "crane"
});

export const MovieTransitionKind = Object.freeze({
	CUT: "cut",
	CROSSFADE: "crossfade",
	WIPE: "wipe",
	LIGHT_WIPE: "light-wipe",
	PARTICLE_DISSOLVE: "particle-dissolve",
	PUSH: "push",
	ZOOM: "zoom",
	IRIS: "iris",
	FLASH: "flash"
});

export const MovieLayerKinds = Object.freeze(Object.values(MovieLayerKind));
export const MovieCameraKinds = Object.freeze(Object.values(MovieCameraKind));
export const MovieTransitionKinds = Object.freeze(Object.values(MovieTransitionKind));

/** Returns the broad semantic family used for adapter capability negotiation. */
export function binahLayerFamily(orKind) {
	if (
		[
			MovieLayerKind.AUDIO,
			MovieLayerKind.DIALOGUE,
			MovieLayerKind.NARRATION,
			MovieLayerKind.MUSIC,
			MovieLayerKind.AMBIENCE,
			MovieLayerKind.SFX
		].includes(orKind)
	) {
		return "audio";
	}
	if (String(orKind || "").endsWith("3d")) {
		return "3d";
	}
	if (
		[
			MovieLayerKind.DATA,
			MovieLayerKind.CHART,
			MovieLayerKind.DIAGRAM,
			MovieLayerKind.FORMULA,
			MovieLayerKind.CODE
		].includes(orKind)
	) {
		return "data";
	}
	return "2d";
}
