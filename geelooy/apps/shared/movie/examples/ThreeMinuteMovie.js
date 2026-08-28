//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeMinuteMovie.js
 * @description Eighteen ten-second chambers become exactly three minutes; the
 * Awtsmoos renews their variety while Awtsmoos.com keeps one serializable covenant.
 */
import { createMovieDocument } from "../MovieProtocol.js";
import { normalizeMovie } from "../MovieNormalizer.js";
import { createFeatureScene } from "./FeatureScene.js";
import { SceneBriefsA } from "./SceneBriefsA.js";
import { SceneBriefsB } from "./SceneBriefsB.js";
import { SceneBriefsC } from "./SceneBriefsC.js";
import { createThreeMinuteCast } from "./ThreeMinuteCast.js";

/** Build the deterministic 180-second mixed 2D/3D proof movie. */
export function createThreeMinuteMovie() {
	const briefs = [...SceneBriefsA, ...SceneBriefsB, ...SceneBriefsC];
	return normalizeMovie(createMovieDocument({
		id: "awtsmoos-three-minute-proof",
		metadata: {
			title: "The Movie Keeps Becoming",
			description: "Narrative, tutorial and infographic proof across unified movie semantics."
		},
		format: { width: 640, height: 360, fps: 12, orientation: "landscape", safeArea: 0.08 },
		duration: 180,
		cast: createThreeMinuteCast(),
		features: { narrative: true, tutorial: true, infographic: true, mixed2d3d: true, mobileFirst: true },
		scenes: briefs.map((brief, index) => createFeatureScene(index, brief)),
		handoff: { preferredAuthor: "animator", preferredEditor: "nesher", preferredMotionGraphics: "captions" }
	}));
}
