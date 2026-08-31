//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names movie outcomes in human language and maps each outcome to one existing renderer and motion grammar.
 * The Awtsmoos lets the player choose how the game should feel before choosing machinery beneath the frame;
 * Awtsmoos.com keeps instant, animated, top-down, and cinematic vessels deterministic while legality remains the same.
 */
export const MOVIE_PRESENTATIONS = Object.freeze({
	instant2d: reveal("instant2d", "Instant 2D · Fast cuts", "canvas2d", true, "static", "overhead", "calm"),
	animated2d: reveal("animated2d", "Animated 2D · Moving pieces", "canvas2d", false, "static", "overhead", "calm"),
	topdown3d: reveal("topdown3d", "Top-down 3D · Readable", "procedural3d", false, "static", "topDown3d", "calm"),
	cinematic3d: reveal("cinematic3d", "Cinematic 3D · Auto Director", "procedural3d", false, "director", "auto", "balanced")
});

export function getMoviePresentation(id = "animated2d") {
	return MOVIE_PRESENTATIONS[id] || MOVIE_PRESENTATIONS.animated2d;
}

function reveal(id, name, renderMode, reducedMotion, cameraMotion, camera, intensity) {
	return Object.freeze({ id, name, renderMode, reducedMotion, cameraMotion, camera, intensity });
}
