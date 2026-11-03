//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderGraph.js
 * @description The canonical movie becomes one deterministic render graph before any pixel is painted;
 * Awtsmoos.com partitions stage plate, screen overlays, and sound from the same sampled timeline so preview and export cannot diverge.
 */
import { MovieLayerKind } from "../schema/MovieSemanticKinds.js";
import { sampleMovieFrame } from "../runtime/MovieSceneSampler.js";
import {
	MovieRenderMode,
	resolveMovieRenderGrade,
	resolveSceneRenderMode
} from "./MovieRenderModes.js";
import {
	cameraRigFor,
	kenBurnsFor,
	sampleCameraRig,
	sampleKenBurns
} from "./CameraMotionPlan.js";

/** Layer kinds that become physical matter on the WebGL stage. */
export const STAGE_PLATE_KINDS = Object.freeze([
	MovieLayerKind.WORLD_3D,
	MovieLayerKind.TERRAIN_3D,
	MovieLayerKind.WATER_3D,
	MovieLayerKind.MODEL_3D,
	MovieLayerKind.CHARACTER_3D,
	MovieLayerKind.PARTICLES_3D,
	MovieLayerKind.GROUP_3D,
	MovieLayerKind.LIGHT_3D
]);

const STAGE_KIND_SET = new Set(STAGE_PLATE_KINDS);
const AUDIO_KINDS = new Set([
	MovieLayerKind.AUDIO,
	MovieLayerKind.MUSIC,
	MovieLayerKind.AMBIENCE,
	MovieLayerKind.SFX,
	MovieLayerKind.NARRATION
]);

const PRIMITIVE_ALIASES = Object.freeze({
	"cube": "box",
	"extruded-cube": "box",
	"block": "box",
	"ball": "sphere",
	"orb": "sphere",
	"pillar": "cylinder",
	"column": "cylinder",
	"person": "figure",
	"human": "figure"
});

export const STAGE_PRIMITIVES = Object.freeze(["box", "cylinder", "sphere", "arch", "figure", "plane"]);

/** Resolve the photographic source a layer points at, through content fields or the movie asset table. */
export function resolveLayerImageSource(orMovie, orLayer) {
	const keliDirect = orLayer?.content?.src || orLayer?.content?.url || orLayer?.content?.image ||
		orLayer?.data?.src || orLayer?.data?.url || null;
	if (keliDirect) return String(keliDirect);
	const keliAssetId = orLayer?.assetId ?? orLayer?.content?.assetId ?? orLayer?.data?.assetId;
	if (!keliAssetId) return null;
	const keliAsset = (orMovie?.assets || []).find(orEntry => orEntry?.id === keliAssetId);
	return keliAsset?.src || keliAsset?.url || keliAsset?.href || null;
}

/** True when a model or character layer names the one external GLB the platform allows: the Chossid. */
export function isChossidReference(orLayer) {
	const keliHaystack = [
		orLayer?.content?.model,
		orLayer?.content?.src,
		orLayer?.content?.assetId,
		orLayer?.content?.character,
		orLayer?.content?.castId,
		orLayer?.content?.procedural?.character,
		orLayer?.data?.model
	].filter(Boolean).join(" ").toLowerCase();
	return keliHaystack.includes("chossid");
}

/** Resolve a scene's declared background into a paintable plate description. */
export function resolveSceneBackground(orMovie, orScene) {
	const keliBackground = orScene?.background;
	if (typeof keliBackground === "string" && keliBackground.trim()) {
		return Object.freeze({ kind: "color", color: keliBackground });
	}
	const keliImage = keliBackground?.image || keliBackground?.src || keliBackground?.url || null;
	if (keliImage) return Object.freeze({ kind: "image", src: String(keliImage) });
	if (Array.isArray(keliBackground?.gradient) && keliBackground.gradient.length >= 2) {
		return Object.freeze({
			kind: "gradient",
			stops: Object.freeze([String(keliBackground.gradient[0]), String(keliBackground.gradient[1])])
		});
	}
	if (keliBackground?.color || keliBackground?.fill) {
		return Object.freeze({ kind: "color", color: String(keliBackground.color || keliBackground.fill) });
	}
	if ((orScene?.layers || []).some(orLayer => orLayer?.kind === MovieLayerKind.WORLD_3D)) {
		return Object.freeze({ kind: "world" });
	}
	return Object.freeze({ kind: "color", color: "#070b18" });
}

/** Build the full render graph for a movie: one plan per scene, warnings aggregated with scene addresses. */
export function buildRenderGraph(orMovie) {
	const keliScenes = (orMovie?.scenes || []).map(orScene => buildSceneRenderPlan(orMovie, orScene));
	return Object.freeze({
		movieId: orMovie?.id || null,
		duration: Number(orMovie?.duration || 0),
		scenes: Object.freeze(keliScenes),
		warnings: Object.freeze(keliScenes.flatMap(orPlan =>
			orPlan.warnings.map(orWarning => Object.freeze({ sceneId: orPlan.sceneId, ...orWarning }))))
	});
}

/**
 * Build one scene's render plan. Pass sampled layers (from the sampler) to get a frame-accurate plan;
 * with raw scene layers the plan describes the scene's static authored state.
 */
export function buildSceneRenderPlan(orMovie, orScene, orLayers) {
	const keliLayers = orLayers || orScene?.layers || [];
	const keliMode = resolveSceneRenderMode(orMovie, orScene);
	const keliWarnings = [];
	const keliPlate = [];
	const keliOverlays = [];
	const keliAudio = [];
	let keliBackground = resolveSceneBackground(orMovie, orScene);
	if (keliMode.effective !== MovieRenderMode.TWO_D && keliBackground.kind === "image") {
		keliPlate.push(Object.freeze({
			layerId: `${orScene?.id || "scene"}-background`,
			kind: "background",
			form: "backdrop",
			textureSrc: keliBackground.src,
			position: Object.freeze({ x: 0, y: 7, z: -18 }),
			scale: Object.freeze({ x: 3.4, y: 3.4, z: 1 }),
			rotation: 0,
			color: null,
			opacity: 1
		}));
		keliBackground = Object.freeze({ kind: "world" });
	}
	for (const keliLayer of keliLayers) {
		partitionLayer(orMovie, keliLayer, keliMode.effective, keliPlate, keliOverlays, keliAudio, keliWarnings);
	}
	const keliCameraKind = typeof orScene?.camera === "string" ? orScene.camera : (orScene?.camera?.kind || "wide");
	return Object.freeze({
		sceneId: orScene?.id || null,
		mode: keliMode,
		background: keliBackground,
		plate: Object.freeze(keliPlate),
		overlays: Object.freeze(keliOverlays),
		audio: Object.freeze(keliAudio),
		camera: Object.freeze({
			kind: keliCameraKind,
			kenBurns: kenBurnsFor(keliCameraKind),
			rig: cameraRigFor(keliCameraKind, orScene?.camera)
		}),
		grade: resolveMovieRenderGrade(orMovie, orScene),
		warnings: Object.freeze(keliWarnings)
	});
}

/**
 * Sample the deterministic timeline at one absolute time and describe the exact frame every renderer must produce.
 * Mode changes alter presentation only: scene, local time, and sampled layer transforms are identical across modes.
 */
export function buildFramePlan(orMovie, orTime = 0) {
	const keliFrame = sampleMovieFrame(orMovie, orTime);
	if (!keliFrame.scene) {
		return Object.freeze({
			time: keliFrame.time,
			sceneId: null,
			localTime: 0,
			progress: 0,
			frameIndex: 0,
			mode: null,
			background: null,
			plate: Object.freeze([]),
			overlays: Object.freeze([]),
			layers: Object.freeze([]),
			grade: resolveMovieRenderGrade(orMovie, null),
			camera: null,
			warnings: Object.freeze([])
		});
	}
	const keliPlan = buildSceneRenderPlan(orMovie, keliFrame.scene, keliFrame.layers);
	const keliDuration = Math.max(0.000001, Number(keliFrame.scene.duration || 0));
	const keliProgress = Math.min(1, Math.max(0, keliFrame.localTime / keliDuration));
	return Object.freeze({
		...keliPlan,
		time: keliFrame.time,
		localTime: keliFrame.localTime,
		progress: keliProgress,
		frameIndex: Math.round(keliFrame.time * Number(orMovie?.format?.fps || 30)),
		layers: Object.freeze(keliFrame.layers),
		camera: Object.freeze({
			...keliPlan.camera,
			sample: Object.freeze({
				kenBurns: sampleKenBurns(keliPlan.camera.kenBurns, keliProgress),
				rig: sampleCameraRig(keliPlan.camera.rig, keliProgress)
			})
		})
	});
}

function partitionLayer(orMovie, orLayer, orEffectiveMode, orPlate, orOverlays, orAudio, orWarnings) {
	const keliKind = orLayer?.kind;
	if (AUDIO_KINDS.has(keliKind)) {
		orAudio.push(orLayer.id);
		return;
	}
	if (keliKind === MovieLayerKind.DIALOGUE) {
		orAudio.push(orLayer.id);
		orOverlays.push(orLayer);
		return;
	}
	if (orEffectiveMode === MovieRenderMode.TWO_D) {
		orOverlays.push(orLayer);
		if (keliKind === MovieLayerKind.IMAGE && !resolveLayerImageSource(orMovie, orLayer)) {
			orWarnings.push(warning("MISSING_IMAGE", orLayer.id,
				`Image layer ${orLayer.id} names no source; a labelled placeholder is painted instead.`));
		}
		return;
	}
	if (STAGE_KIND_SET.has(keliKind)) {
		orPlate.push(stageDescriptor(orMovie, orLayer, orWarnings));
		return;
	}
	if (keliKind === MovieLayerKind.IMAGE) {
		if (!resolveLayerImageSource(orMovie, orLayer)) {
			orWarnings.push(warning("MISSING_IMAGE", orLayer.id,
				`Image layer ${orLayer.id} names no source; a labelled placeholder is painted instead.`));
			orOverlays.push(orLayer);
			return;
		}
		if (orEffectiveMode === MovieRenderMode.THREE_D) {
			orPlate.push(stageDescriptor(orMovie, orLayer, orWarnings));
			return;
		}
		orOverlays.push(orLayer);
		return;
	}
	orOverlays.push(orLayer);
}

/** Describe one layer as physical stage matter; only the Chossid is an external model, all else is procedural. */
export function stageDescriptor(orMovie, orLayer, orWarnings = []) {
	const keliTransform = orLayer?.transform || {};
	const keliBase = {
		layerId: orLayer?.id || null,
		kind: orLayer?.kind || null,
		position: Object.freeze({
			x: Number(keliTransform.x || 0) * 6,
			y: Number(keliTransform.y || 0) * 3,
			z: Number(keliTransform.z || 0) * 6
		}),
		scale: Object.freeze({
			x: Number(keliTransform.scaleX ?? 1),
			y: Number(keliTransform.scaleY ?? keliTransform.scaleX ?? 1),
			z: Number(keliTransform.scaleZ ?? 1)
		}),
		rotation: Number(keliTransform.rotation || 0),
		color: orLayer?.style?.fill || orLayer?.content?.color || null,
		opacity: Number(keliTransform.opacity ?? 1)
	};
	switch (orLayer?.kind) {
		case MovieLayerKind.WORLD_3D:
			return Object.freeze({ ...keliBase, form: "world", recipe: Object.freeze({ ...(orLayer.content?.procedural || {}) }) });
		case MovieLayerKind.TERRAIN_3D:
			return Object.freeze({ ...keliBase, form: "terrain", recipe: Object.freeze({ ...(orLayer.content?.procedural || {}) }) });
		case MovieLayerKind.WATER_3D:
			return Object.freeze({
				...keliBase, form: "water",
				level: Number(orLayer.content?.level ?? 0),
				body: orLayer.content?.body || "lake"
			});
		case MovieLayerKind.LIGHT_3D:
			return Object.freeze({
				...keliBase, form: "light",
				intensity: Number(orLayer.data?.intensity ?? 1),
				direction: orLayer.data?.direction || null
			});
		case MovieLayerKind.PARTICLES_3D:
			return Object.freeze({
				...keliBase, form: "particles",
				count: Number(orLayer.data?.count ?? 90),
				seed: Number(orLayer.data?.seed ?? 0)
			});
		case MovieLayerKind.GROUP_3D:
			return Object.freeze({ ...keliBase, form: "group" });
		case MovieLayerKind.MODEL_3D: {
			if (isChossidReference(orLayer)) {
				return Object.freeze({ ...keliBase, form: "model", model: "chossid", primitive: null });
			}
			orWarnings.push(warning("PROCEDURAL_MODEL", orLayer.id,
				`Model layer ${orLayer.id} is rendered as a procedural stand-in; chossid.glb is the only external model.`));
			return Object.freeze({
				...keliBase, form: "model", model: "procedural",
				primitive: normalizePrimitive(orLayer, orWarnings)
			});
		}
		case MovieLayerKind.CHARACTER_3D: {
			if (isChossidReference(orLayer)) {
				return Object.freeze({ ...keliBase, form: "character", model: "chossid", primitive: null });
			}
			orWarnings.push(warning("PROCEDURAL_MODEL", orLayer.id,
				`Character layer ${orLayer.id} is rendered as a procedural figure; chossid.glb is the only external model.`));
			return Object.freeze({ ...keliBase, form: "character", model: "procedural", primitive: "figure" });
		}
		case MovieLayerKind.IMAGE:
			return Object.freeze({
				...keliBase, form: "billboard",
				textureSrc: resolveLayerImageSource(orMovie, orLayer)
			});
		default:
			return Object.freeze({ ...keliBase, form: "piece", primitive: "box" });
	}
}

function normalizePrimitive(orLayer, orWarnings) {
	const keliRaw = String(
		orLayer?.content?.primitive || orLayer?.content?.preset || orLayer?.content?.shape || "box"
	).toLowerCase();
	const keliPrimitive = PRIMITIVE_ALIASES[keliRaw] || keliRaw;
	if (STAGE_PRIMITIVES.includes(keliPrimitive)) return keliPrimitive;
	orWarnings.push(warning("UNKNOWN_PRIMITIVE", orLayer.id,
		`Unknown set-piece primitive ${JSON.stringify(keliRaw)} on layer ${orLayer.id}; a box is used instead.`));
	return "box";
}

function warning(orCode, orLayerId, orMessage) {
	return Object.freeze({ code: orCode, layerId: orLayerId || null, message: orMessage });
}
