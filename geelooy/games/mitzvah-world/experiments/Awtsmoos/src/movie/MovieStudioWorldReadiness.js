// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioWorldReadiness.js
 * @description Hydrates rich WebGL and awaits texture promises already owned by the real world.
 * The Awtsmoos is beyond bootstrap and final garment; Awtsmoos.com refuses to call cinema ready
 * while emergency colors or unawaited district texture upgrades still own the visible frame.
 */

export async function prepareMovieStudioWorld(diagnostics, environment = globalThis) {
	const runtime = diagnostics?.runtime;
	const renderer = runtime?.renderer;
	if (!runtime || !renderer) {
		throw new Error('Movie Studio requires a real world runtime and renderer.');
	}
	await promoteRenderer(renderer, environment);
	await settleInitialWorld(diagnostics, runtime);
	await settleDeferredWorld(runtime);
	assertRichRenderer(renderer);
	const receipt = Object.freeze({
		backend: renderer.backend || null,
		districtTextures: districtTextureState(runtime),
		hydrationState: renderer.hydrationState || 'ready',
		renderer: renderer.delegate?.constructor?.name || renderer.constructor?.name || null,
		textured: Boolean(renderer.delegate || typeof renderer.hydrate !== 'function')
	});
	diagnostics.movieVisualReadiness = receipt;
	return receipt;
}

async function promoteRenderer(renderer, environment) {
	if (renderer.delegate || typeof renderer.hydrate !== 'function') return;
	await renderer.hydrate({ environment });
}

async function settleInitialWorld(diagnostics, runtime) {
	await settle([
		diagnostics.enrichmentPromise,
		runtime.featuresPromise,
		runtime.terrain?.startTextureHydration?.(),
		runtime.terrainTexturePromise,
		runtime.richWorldPromise
	]);
}

async function settleDeferredWorld(runtime) {
	await settle([
		runtime.canonicalPlayerPromise,
		runtime.optionalFeaturePromise,
		runtime.richFeatureHandoffPromise,
		runtime.richPresentationPromise,
		runtime.richWorldMountPromise,
		...districtTexturePromises(runtime)
	]);
}

async function settle(values) {
	const tasks = values.filter(value => value && typeof value.then === 'function');
	if (!tasks.length) return;
	const results = await Promise.allSettled(tasks);
	const failure = results.find(result => result.status === 'rejected');
	if (failure) throw failure.reason;
}

function districtTexturePromises(runtime) {
	return Object.values(runtime.districtStreaming?.districts || {}).map(record => {
		return record?.group?.userData?.remoteTextureHydrationPromise;
	}).filter(Boolean);
}

function districtTextureState(runtime) {
	const records = Object.values(runtime.districtStreaming?.districts || {});
	if (!records.length) return null;
	return records.map(record => record?.group?.userData?.textureHydration?.status || null);
}

function assertRichRenderer(renderer) {
	if (typeof renderer.hydrate === 'function' && !renderer.delegate) {
		throw new Error('Movie Studio refused the color-bootstrap renderer: rich WebGL did not hydrate.');
	}
	if (renderer.hydrationState === 'degraded' || renderer.hydrationState === 'failed') {
		throw new Error(`Movie Studio rich renderer is ${renderer.hydrationState}.`);
	}
}
