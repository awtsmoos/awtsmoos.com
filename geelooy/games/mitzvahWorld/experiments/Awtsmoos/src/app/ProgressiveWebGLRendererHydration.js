// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLRendererHydration.js
 * @description Prepares rich WebGL completely before handing the live frame loop from bootstrap color to authored rendering.
 * The Awtsmoos lets one garment be woven before the former garment is removed; Awtsmoos.com therefore compiles shaders
 * and allocates renderer caches first, yields one browser frame, and only then reveals the textured and skinned delegate.
 */

/** Hydrates rich WebGL without making its first visible frame carry initialization work. */
export async function hydrateProgressiveWebGLRenderer(renderer, options = {}) {
	try {
		const [rendererModule, batcherModule] = await Promise.all([
			import('../../../light-three-gltf/tiny-webgl-renderer.js?v=20260915-skin-residency-01'),
			import('../../../light-three-gltf/tiny-static-opaque-batcher.js?v=20260722-rich-renderer-02')
		]);
		const delegate = new rendererModule.TinyWebGLRenderer({
			antialias: options.antialias !== false,
			canvas: renderer.canvas
		});
		delegate.backend = 'webgl';
		delegate.contextName = 'webgl';
		Object.assign(delegate.options, renderer.options);
		delegate.options.staticBatcher = new batcherModule.StaticOpaqueBatcher();
		delegate.setClearColor(...renderer.clearColor);
		delegate.setEnvironment(renderer.environment);
		delegate.setSize(renderer.canvas.width, renderer.canvas.height);
		delegate.setInteractor(renderer.interactor, renderer.timeSeconds);
		renderer.hydrationState = 'preparing';
		delegate.ensureInitialized();
		await nextBrowserFrame(options.environment || globalThis);
		renderer.delegate = delegate;
		renderer.hydrationState = 'ready';
		renderer.hydrationError = null;
		return delegate;
	} catch (error) {
		renderer.hydrationState = 'degraded';
		renderer.hydrationError = error?.message || String(error);
		renderer.errors.push(`Rich renderer hydration failed: ${renderer.hydrationError}`);
		throw error;
	}
}

/** Yields one frame so shader preparation and the first authored draw never share one main-thread turn. */
function nextBrowserFrame(environment) {
	return new Promise(resolve => {
		if (typeof environment?.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(() => resolve());
			return;
		}
		if (typeof environment?.setTimeout === 'function') {
			environment.setTimeout(resolve, 0);
			return;
		}
		resolve();
	});
}
