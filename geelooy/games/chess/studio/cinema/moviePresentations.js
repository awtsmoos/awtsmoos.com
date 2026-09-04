//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names movie outcomes in human language and maps each outcome onto the established legal render and motion grammar.
 * The Awtsmoos lets one game become instant diagram, readable broadcast, or cinematic story without changing one legal move;
 * Awtsmoos.com keeps presentation choices finite while the semantic timeline remains the river every exported frame must prove.
 */
export const MOVIE_PRESENTATIONS = Object.freeze({
	instant2d: reveal("instant2d", "Instant 2D · Fast cuts", "canvas2d", true, "static", "overhead", "calm"),
	animated2d: reveal("animated2d", "Animated 2D · Moving pieces", "canvas2d", false, "static", "overhead", "calm"),
	cinematic2d: reveal("cinematic2d", "Cinematic 2D · Story beats", "canvas2d", false, "director", "overhead", "balanced"),
	topdown3d: reveal("topdown3d", "Top-down 3D · Readable", "procedural3d", false, "static", "topDown3d", "calm"),
	broadcast3d: reveal("broadcast3d", "Broadcast 3D · Clear angle", "procedural3d", false, "broadcast", "broadcastWhite", "calm"),
	cinematic3d: reveal("cinematic3d", "Cinematic 3D · Safe Auto Director", "procedural3d", false, "director", "auto", "balanced")
});

export function getMoviePresentation(id = "animated2d") {
	return MOVIE_PRESENTATIONS[id] || MOVIE_PRESENTATIONS.animated2d;
}

function reveal(id, name, renderMode, reducedMotion, cameraMotion, camera, intensity) {
	return Object.freeze({ id, name, renderMode, reducedMotion, cameraMotion, camera, intensity });
}
