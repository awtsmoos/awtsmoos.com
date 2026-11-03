// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Mitzvah World Animator speaks the platform's canonical movie tongue through this
 * one translation vessel: an Editor scene document becomes an awtsmoos-movie-v1 movie
 * (one scene; every object a model3d layer) that Awtsmoos Studio and the Animator dock
 * can load, validate, play, and export — and a canonical movie's model3d layers can
 * travel back into an Editor scene document. The translation is honest about its edges:
 * hierarchy is flattened (parentage is preserved inside layer content), rotation.x/y
 * and material color tracks have no canonical transform channel, so they ride in a
 * `content.editorTracks` sidecar and are counted in the report instead of vanishing.
 */
import { EDITOR_SCENE_FORMAT, EDITOR_SCENE_VERSION, flattenSceneObjects } from "./EditorSceneDocument.js";

/** Editor track path -> canonical keyframe channel (the sampler writes transform.* onto layers). */
const TRACK_TO_CHANNEL = {
	"position.x": "transform.x",
	"position.y": "transform.y",
	"position.z": "transform.z",
	"scale.x": "transform.scaleX",
	"scale.y": "transform.scaleY",
	"scale.z": "transform.scaleZ",
	"rotation.z": "transform.rotation",
	"material.opacity": "transform.opacity"
};

/** Canonical channel -> Editor track path (exact inverse of TRACK_TO_CHANNEL). */
const CHANNEL_TO_TRACK = Object.fromEntries(
	Object.entries(TRACK_TO_CHANNEL).map(([shemTrack, shemChannel]) => [shemChannel, shemTrack])
);

/** Editor primitive names (userData.type) -> canonical model3d content.primitive vocabulary. */
const PRIMITIVE_BY_EDITOR_TYPE = {
	Box: "cube",
	Sphere: "sphere",
	Plane: "plane",
	Cylinder: "cylinder",
	Cone: "cone",
	Torus: "torus"
};

/** Canonical primitive vocabulary -> Editor primitive names. */
const EDITOR_TYPE_BY_PRIMITIVE = Object.fromEntries(
	Object.entries(PRIMITIVE_BY_EDITOR_TYPE).map(([shemType, shemPrimitive]) => [shemPrimitive, shemType])
);

const EASING_BY_INTERPOLATION = { LINEAR: "linear", STEP: "hold" };
const INTERPOLATION_BY_EASING = { linear: "LINEAR", hold: "STEP" };

/**
 * Translate an Editor scene document into a canonical awtsmoos-movie-v1 movie.
 * @param {object} ohrDocument Editor scene document (see EditorSceneDocument).
 * @returns {{movie:object, report:{objects:number, layersWithTracks:number, sidecarTracks:number, lastKeyframeTime:number}}}
 */
export function sceneDocumentToCanonicalMovie(ohrDocument) {
	const reshimuFlat = flattenSceneObjects(ohrDocument);
	const mapLayerByUuid = new Map((ohrDocument.layers || []).map(kliLayer => [kliLayer.objectUuid, kliLayer]));
	let lastKeyframeTime = 0;
	let sidecarTracks = 0;
	let layersWithTracks = 0;

	const kelimLayers = reshimuFlat.map(({ record, parentUuid }, misparIndex) => {
		const ohrDocLayer = mapLayerByUuid.get(record.uuid);
		const kelimKeyframes = [];
		const kelimSidecar = [];
		for (const kliTrack of ohrDocLayer?.tracks || []) {
			const shemChannel = TRACK_TO_CHANNEL[kliTrack.propertyPath];
			const kelimMapped = [];
			for (const kliKeyframe of kliTrack.keyframes || []) {
				lastKeyframeTime = Math.max(lastKeyframeTime, Number(kliKeyframe.time) || 0);
				if (shemChannel && typeof kliKeyframe.value === "number") {
					kelimMapped.push({
						at: kliKeyframe.time,
						channel: shemChannel,
						value: kliKeyframe.value,
						easing: EASING_BY_INTERPOLATION[kliKeyframe.interpolation] || "linear"
					});
				}
			}
			if (kelimMapped.length) {
				kelimKeyframes.push(...kelimMapped);
			}
			if (!shemChannel || kelimMapped.length !== (kliTrack.keyframes || []).length) {
				kelimSidecar.push(kliTrack);
				sidecarTracks += 1;
			}
		}
		if (kelimKeyframes.length) {
			layersWithTracks += 1;
		}
		kelimKeyframes.sort((a, b) => a.at - b.at);
		const ohrContent = {
			primitive: primitiveForRecord(record),
			name: record.name || "",
			editor: {
				uuid: record.uuid,
				editorType: record.editorType,
				threeType: record.threeType,
				parentUuid
			}
		};
		if (kelimSidecar.length) {
			ohrContent.editorTracks = kelimSidecar;
		}
		return {
			id: `object-${misparIndex + 1}-${slugify(record.name) || "layer"}`,
			kind: "model3d",
			start: 0,
			duration: 0,
			content: ohrContent,
			style: record.material?.color ? { fill: record.material.color } : {},
			transform: {
				x: component(record.position, 0),
				y: component(record.position, 1),
				z: component(record.position, 2),
				rotation: component(record.rotation, 2),
				scaleX: component(record.scale, 0, 1),
				scaleY: component(record.scale, 1, 1),
				scaleZ: component(record.scale, 2, 1),
				opacity: typeof record.material?.opacity === "number" ? record.material.opacity : 1
			},
			keyframes: kelimKeyframes
		};
	});

	const misparDuration = Math.max(Number(ohrDocument.duration) || 0, lastKeyframeTime, 1);
	for (const kliLayer of kelimLayers) {
		kliLayer.duration = misparDuration;
	}
	const ohrScene = {
		id: "scene-1",
		start: 0,
		duration: misparDuration,
		name: ohrDocument.name || "Untitled Scene",
		camera: { kind: "wide" },
		transition: { kind: "cut" },
		layers: kelimLayers
	};
	if (ohrDocument.background) {
		ohrScene.background = { color: ohrDocument.background };
	}
	const ohrMovie = {
		protocol: "awtsmoos-movie-v1",
		version: 1,
		id: slugify(ohrDocument.name) || "editor-scene",
		metadata: { title: ohrDocument.name || "Untitled Scene" },
		format: { width: 1280, height: 720, fps: 30, orientation: "landscape" },
		duration: misparDuration,
		cast: [],
		assets: [],
		scenes: [ohrScene],
		handoff: { source: "mitzvah-world-animator", sceneFormat: EDITOR_SCENE_FORMAT, sceneVersion: EDITOR_SCENE_VERSION }
	};
	return {
		movie: ohrMovie,
		report: {
			objects: kelimLayers.length,
			layersWithTracks,
			sidecarTracks,
			lastKeyframeTime
		}
	};
}

/**
 * Translate a canonical movie back into an Editor scene document. Only model3d
 * layers become objects; every other layer kind is counted in the report so the
 * import can state plainly what it did not bring across.
 * @param {object} ohrMovie Canonical awtsmoos-movie-v1 movie (already parsed).
 * @returns {{document:object, report:{imported:number, skippedLayers:number, skippedKinds:string[]}}}
 */
export function canonicalMovieToSceneDocument(ohrMovie) {
	if (!ohrMovie || ohrMovie.protocol !== "awtsmoos-movie-v1") {
		throw new TypeError('Not a canonical movie (expected protocol "awtsmoos-movie-v1").');
	}
	const kelimObjects = [];
	const kelimLayers = [];
	const setSkippedKinds = new Set();
	let skippedLayers = 0;

	for (const ohrScene of ohrMovie.scenes || []) {
		const misparSceneStart = Number(ohrScene.start) || 0;
		for (const kliLayer of ohrScene.layers || []) {
			if (kliLayer.kind !== "model3d") {
				skippedLayers += 1;
				setSkippedKinds.add(kliLayer.kind || "unknown");
				continue;
			}
			const ohrTransform = kliLayer.transform || {};
			const shemUuid = `imported-${kliLayer.id || kelimObjects.length + 1}`;
			kelimObjects.push({
				uuid: shemUuid,
				name: kliLayer.content?.name || kliLayer.id || "Imported Object",
				editorType: EDITOR_TYPE_BY_PRIMITIVE[kliLayer.content?.primitive] || null,
				threeType: "Mesh",
				isGroup: false,
				visible: true,
				position: [num(ohrTransform.x), num(ohrTransform.y), num(ohrTransform.z)],
				rotation: [0, 0, num(ohrTransform.rotation)],
				scale: [num(ohrTransform.scaleX, 1), num(ohrTransform.scaleY, 1), num(ohrTransform.scaleZ, 1)],
				geometry: null,
				material: kliLayer.style?.fill
					? { type: "MeshStandardMaterial", color: kliLayer.style.fill, opacity: num(ohrTransform.opacity, 1) }
					: null,
				children: []
			});
			const mapTrackByPath = new Map();
			const misparOffset = misparSceneStart + (Number(kliLayer.start) || 0);
			for (const kliKeyframe of kliLayer.keyframes || []) {
				const shemTrack = CHANNEL_TO_TRACK[kliKeyframe.channel];
				if (!shemTrack || typeof kliKeyframe.value !== "number") {
					continue;
				}
				if (!mapTrackByPath.has(shemTrack)) {
					mapTrackByPath.set(shemTrack, { propertyPath: shemTrack, keyframes: [] });
				}
				mapTrackByPath.get(shemTrack).keyframes.push({
					time: misparOffset + (Number(kliKeyframe.at) || 0),
					value: kliKeyframe.value,
					interpolation: INTERPOLATION_BY_EASING[kliKeyframe.easing] || "LINEAR"
				});
			}
			for (const kliTrack of kliLayer.content?.editorTracks || []) {
				mapTrackByPath.set(kliTrack.propertyPath, kliTrack);
			}
			if (mapTrackByPath.size) {
				kelimLayers.push({
					objectUuid: shemUuid,
					objectName: kliLayer.content?.name || kliLayer.id || "",
					tracks: [...mapTrackByPath.values()]
				});
			}
		}
	}

	return {
		document: {
			format: EDITOR_SCENE_FORMAT,
			version: EDITOR_SCENE_VERSION,
			name: ohrMovie.metadata?.title || ohrMovie.id || "Imported Movie",
			duration: Number(ohrMovie.duration) || 0,
			background: null,
			objects: kelimObjects,
			layers: kelimLayers
		},
		report: {
			imported: kelimObjects.length,
			skippedLayers,
			skippedKinds: [...setSkippedKinds]
		}
	};
}

function primitiveForRecord(ohrRecord) {
	if (ohrRecord.editorType && PRIMITIVE_BY_EDITOR_TYPE[ohrRecord.editorType]) {
		return PRIMITIVE_BY_EDITOR_TYPE[ohrRecord.editorType];
	}
	const shemGeometry = String(ohrRecord.geometry?.type || "").replace(/Geometry$/, "");
	return PRIMITIVE_BY_EDITOR_TYPE[shemGeometry] || "cube";
}

function component(reshimuValues, misparIndex, ohrFallback = 0) {
	const mispar = Number(reshimuValues?.[misparIndex]);
	return Number.isFinite(mispar) ? mispar : ohrFallback;
}

function num(ohrValue, ohrFallback = 0) {
	const mispar = Number(ohrValue);
	return Number.isFinite(mispar) ? mispar : ohrFallback;
}

function slugify(shemValue) {
	return String(shemValue || "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
