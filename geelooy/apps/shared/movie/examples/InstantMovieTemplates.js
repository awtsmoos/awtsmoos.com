//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InstantMovieTemplates.js
 * @description Three small canonical proofs that JSON alone can become a movie at once;
 * Awtsmoos.com ships a photo story, a built 3D stage, and a hybrid so the instant generator can be believed, not merely described.
 */

const PHOTO_VALLEY = "https://picsum.photos/seed/awtsmoos-valley/1280/720";
const PHOTO_RIVER = "https://picsum.photos/seed/awtsmoos-river/1280/720";
const PHOTO_VILLAGE = "https://picsum.photos/seed/awtsmoos-village/1280/720";

const FORMAT = Object.freeze({
	width: 1280,
	height: 720,
	fps: 30,
	orientation: "landscape",
	safeArea: 0.08
});

/** Photo Story: photographic plates, Ken Burns cameras, captions, and a letterboxed grade. */
export function createPhotoStoryTemplate() {
	return {
		protocol: "awtsmoos-movie-v1",
		version: 1,
		id: "instant-photo-story",
		metadata: { title: "Photo Story — Instant 2D" },
		format: { ...FORMAT },
		duration: 18,
		render: { mode: "2d", grade: { letterbox: 0.07, vignette: 0.36, grain: 0.05, temperature: 0.15 } },
		cast: [],
		assets: [
			{ id: "photo-valley", kind: "image", src: PHOTO_VALLEY },
			{ id: "photo-river", kind: "image", src: PHOTO_RIVER },
			{ id: "photo-village", kind: "image", src: PHOTO_VILLAGE }
		],
		scenes: [
			{
				id: "dawn", name: "Dawn", start: 0, duration: 6,
				camera: { kind: "wide" }, transition: { kind: "cut" },
				background: { image: PHOTO_VALLEY },
				layers: [
					{
						id: "dawn-title", kind: "text", start: 0, duration: 6,
						content: { text: "The Valley at Dawn", subtitle: "An instant photo story, generated from JSON" },
						keyframes: [
							{ at: 0, channel: "transform.y", value: 0.05 },
							{ at: 2, channel: "transform.y", value: 0 }
						]
					},
					{
						id: "dawn-caption", kind: "caption", start: 0, duration: 6,
						content: { text: "First light spills over the ridge." }
					}
				]
			},
			{
				id: "river", name: "River", start: 6, duration: 6,
				camera: { kind: "dolly" }, transition: { kind: "crossfade" },
				background: { image: PHOTO_RIVER },
				layers: [
					{
						id: "river-card", kind: "image", start: 0, duration: 6,
						content: { assetId: "photo-village", fit: "contain", width: 0.3 },
						transform: { x: 0.55, y: -0.05, rotation: 0.03 }
					},
					{
						id: "river-caption", kind: "caption", start: 0, duration: 6,
						content: { text: "The river road, with the village still ahead." }
					}
				]
			},
			{
				id: "village", name: "Village", start: 12, duration: 6,
				camera: { kind: "closeup" }, transition: { kind: "crossfade" },
				background: { image: PHOTO_VILLAGE },
				layers: [
					{
						id: "village-title", kind: "text", start: 0, duration: 6,
						content: { text: "Home Before Dark", subtitle: "No timeline was edited. The JSON was enough." }
					},
					{
						id: "village-caption", kind: "caption", start: 0, duration: 6,
						content: { text: "Shabbat Shalom." }
					}
				]
			}
		],
		features: {},
		handoff: {}
	};
}

/** 3D Scene: a real-time stage — terrain, water, light, the Chossid model, and procedural set pieces. */
export function createThreeDSceneTemplate() {
	return {
		protocol: "awtsmoos-movie-v1",
		version: 1,
		id: "instant-3d-scene",
		metadata: { title: "The Mountain Court — Instant 3D" },
		format: { ...FORMAT },
		duration: 20,
		render: { mode: "3d", grade: { vignette: 0.3, grain: 0.04 } },
		cast: [],
		assets: [],
		scenes: [
			{
				id: "mountain-court", name: "Mountain Court", start: 0, duration: 10,
				camera: { kind: "crane" }, transition: { kind: "cut" },
				layers: [
					{ id: "world", kind: "world3d", start: 0, duration: 10, content: { procedural: { profile: "mountain", seed: 613, character: "chossid" } } },
					{ id: "terrain", kind: "terrain3d", start: 0, duration: 10, content: { procedural: { profile: "mountain", seed: 613 } } },
					{ id: "water", kind: "water3d", start: 0, duration: 10, content: { body: "lake", level: 0 } },
					{ id: "sun", kind: "light3d", start: 0, duration: 10, data: { intensity: 1.15, direction: { x: -0.4, y: -1, z: 0.25 } } },
					{ id: "hero", kind: "character3d", start: 0, duration: 10, content: { character: "chossid" }, transform: { x: 0, y: 0, z: 0.2 } },
					{
						id: "arch", kind: "model3d", start: 0, duration: 10,
						content: { primitive: "arch" }, transform: { x: -1, y: 0, z: 0.4 },
						keyframes: [
							{ at: 0, channel: "transform.rotation", value: 0 },
							{ at: 9, channel: "transform.rotation", value: 0.5 }
						]
					},
					{ id: "orb", kind: "model3d", start: 0, duration: 10, content: { primitive: "sphere" }, transform: { x: 1.1, y: 0, z: 0.6 } },
					{
						id: "court-title", kind: "text", start: 0, duration: 10,
						content: { text: "The Mountain Court", subtitle: "A real-time WebGL stage, generated from JSON" }
					}
				]
			},
			{
				id: "orbit-pieces", name: "Orbit Pieces", start: 10, duration: 10,
				camera: { kind: "orbit" }, transition: { kind: "crossfade" },
				layers: [
					{ id: "world-2", kind: "world3d", start: 0, duration: 10, content: { procedural: { profile: "mountain", seed: 777 } } },
					{ id: "terrain-2", kind: "terrain3d", start: 0, duration: 10, content: { procedural: { profile: "mountain", seed: 777 } } },
					{ id: "sun-2", kind: "light3d", start: 0, duration: 10, data: { intensity: 1 } },
					{ id: "tower", kind: "model3d", start: 0, duration: 10, content: { primitive: "cylinder" }, transform: { x: -0.8, y: 0, z: 0.3 } },
					{ id: "block", kind: "model3d", start: 0, duration: 10, content: { primitive: "box" }, transform: { x: 0.9, y: 0, z: 0.1 } },
					{ id: "elder", kind: "character3d", start: 0, duration: 10, content: { character: "villager" }, transform: { x: 0.3, y: 0, z: 0.5 } },
					{
						id: "orbit-caption", kind: "caption", start: 0, duration: 10,
						content: { text: "Every piece is generated geometry. Only the Chossid is a model file." }
					}
				]
			}
		],
		features: {},
		handoff: {}
	};
}

/** Hybrid: the 3D stage as plate, with photographs, captions, and titles composited above it. */
export function createHybridTemplate() {
	return {
		protocol: "awtsmoos-movie-v1",
		version: 1,
		id: "instant-hybrid",
		metadata: { title: "Stage & Photograph — Instant Hybrid" },
		format: { ...FORMAT },
		duration: 16,
		render: { mode: "hybrid", grade: { vignette: 0.3, grain: 0.05 } },
		cast: [],
		assets: [
			{ id: "photo-river", kind: "image", src: PHOTO_RIVER }
		],
		scenes: [
			{
				id: "stage-and-card", name: "Stage and Card", start: 0, duration: 8,
				camera: { kind: "dolly" }, transition: { kind: "cut" },
				layers: [
					{ id: "h-world", kind: "world3d", start: 0, duration: 8, content: { procedural: { profile: "mountain", seed: 613 } } },
					{ id: "h-terrain", kind: "terrain3d", start: 0, duration: 8, content: { procedural: { profile: "mountain", seed: 613 } } },
					{ id: "h-sun", kind: "light3d", start: 0, duration: 8, data: { intensity: 1.1 } },
					{ id: "h-arch", kind: "model3d", start: 0, duration: 8, content: { primitive: "arch" }, transform: { x: -0.7, y: 0, z: 0.3 } },
					{ id: "h-hero", kind: "character3d", start: 0, duration: 8, content: { character: "chossid" }, transform: { x: 0.2, y: 0, z: 0.2 } },
					{
						id: "h-photo", kind: "image", start: 0, duration: 8,
						content: { assetId: "photo-river", fit: "contain", width: 0.3 },
						transform: { x: 0.58, y: -0.12, rotation: -0.02 }
					},
					{
						id: "h-caption", kind: "caption", start: 0, duration: 8,
						content: { text: "A 3D stage below; a photograph and words above." }
					}
				]
			},
			{
				id: "photo-and-form", name: "Photo and Form", start: 8, duration: 8,
				camera: { kind: "medium" }, transition: { kind: "crossfade" },
				background: { gradient: ["#2b3a67", "#0b1026"] },
				layers: [
					{ id: "p-orb", kind: "model3d", start: 0, duration: 8, content: { primitive: "sphere" }, transform: { x: -0.6, y: 0, z: 0.4 } },
					{ id: "p-block", kind: "model3d", start: 0, duration: 8, content: { primitive: "box" }, transform: { x: 0.7, y: 0, z: 0.2 } },
					{
						id: "p-title", kind: "text", start: 0, duration: 8,
						content: { text: "Depth, Then Words", subtitle: "Hybrid renders both vessels in one pass" }
					},
					{
						id: "p-caption", kind: "caption", start: 0, duration: 8,
						content: { text: "Set pieces stand in the stage; the story rides on top." }
					}
				]
			}
		],
		features: {},
		handoff: {}
	};
}

/** The three instant-generator proofs, in shelf order. */
export const INSTANT_MOVIE_TEMPLATES = Object.freeze([
	Object.freeze({
		id: "instant-photo-story",
		title: "Photo Story",
		mode: "2d",
		description: "Photographic plates with camera drift, captions, and a letterboxed grade.",
		createMovie: createPhotoStoryTemplate
	}),
	Object.freeze({
		id: "instant-3d-scene",
		title: "3D Scene",
		mode: "3d",
		description: "Terrain, water, light, the Chossid, and procedural set pieces on a real-time stage.",
		createMovie: createThreeDSceneTemplate
	}),
	Object.freeze({
		id: "instant-hybrid",
		title: "Hybrid",
		mode: "hybrid",
		description: "The 3D stage as plate with a photograph, captions, and titles composited above.",
		createMovie: createHybridTemplate
	})
]);

/** Presentation-safe metadata for the instant template shelf. */
export function describeInstantMovieTemplates() {
	return INSTANT_MOVIE_TEMPLATES.map(orTemplate => ({
		id: orTemplate.id,
		title: orTemplate.title,
		mode: orTemplate.mode,
		description: orTemplate.description
	}));
}

/** Create a fresh canonical movie from one instant template id; unknown ids throw honestly. */
export function createInstantMovieTemplate(orId) {
	const keliTemplate = INSTANT_MOVIE_TEMPLATES.find(orEntry => orEntry.id === orId);
	if (!keliTemplate) throw new Error(`Unknown instant movie template: ${orId}`);
	return keliTemplate.createMovie();
}
