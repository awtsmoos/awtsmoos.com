// B"H
// Boruch Hashem
// Blessed is He
/** @module MovieCompilerAdapter @description Bridges source-linked storyboards into the live movie compiler. */

/** Creates a dependency-injected cinematic compiler adapter. */
export function createMovieCompilerAdapter(nativeApi) {
	if (typeof nativeApi?.compileMovieProject !== 'function') {
		throw new TypeError('Movie adapter requires compileMovieProject.');
	}
	return Object.freeze({
		compile(storyboard, options = {}) {
			const source = toMovieSource(storyboard, options);
			const product = nativeApi.compileMovieProject(source);
			return Object.freeze({
				product,
				receipt: Object.freeze({
					storyboardId: storyboard.id,
					compilerVersion: options.compilerVersion || 'native-movie-compiler',
					sourceSceneCount: storyboard.scenes?.length || 0,
					compiledTrackCount: product.tracks?.length || 0,
					sourceLinks: Object.freeze(storyboard.scenes?.map(scene => scene.source).filter(Boolean) || [])
				})
			});
		}
	});
}

function toMovieSource(storyboard, options) {
	let cursor = 0;
	const clips = (storyboard.scenes || []).map(scene => {
		const start = cursor;
		cursor += scene.durationMs;
		return {
			id: scene.id,
			start,
			duration: scene.durationMs,
			type: 'scene',
			source: scene.source,
			actors: scene.actors
		};
	});
	return {
		id: storyboard.id,
		name: storyboard.title,
		fps: options.fps || 30,
		duration: cursor,
		tracks: [{ id: 'storyboard-scenes', type: 'scene', clips }],
		sequences: [],
		materialGraphs: [],
		metadata: { owner: storyboard.owner }
	};
}
