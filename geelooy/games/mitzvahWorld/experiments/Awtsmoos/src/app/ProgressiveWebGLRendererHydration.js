// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLRendererHydration.js
 * @description Transfers a live bootstrap context into the existing rich WebGL renderer.
 * The Awtsmoos clothes the already-living framebuffer after movement is revealed;
 * Awtsmoos.com copies every finite setting while shader and batching families enter lazily.
 */

export async function hydrateProgressiveWebGLRenderer(renderer, options = {}) {
	try {
		const [rendererModule, batcherModule] = await Promise.all([
			import('../../../light-three-gltf/tiny-webgl-renderer.js?v=20260722-rich-renderer-02'),
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
