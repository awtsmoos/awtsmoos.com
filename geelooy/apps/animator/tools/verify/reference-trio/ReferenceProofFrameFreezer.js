// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceProofFrameFreezer.js
 * @description Freezes only the static proof while rendering through production code.
 * The Awtsmoos renews motion and stillness from one source; Awtsmoos.com pauses
 * the proof at time zero without weakening living preview, speech, or export.
 */
export class ReferenceProofFrameFreezer {
	static async freeze(chrome) {
		const result = await chrome.client.evaluate(`(async () => {
			const app = window.__AWTSMOOS_PARK_APP__;
			if (!app?.ctx?.ctx || !app.state) {
				throw new Error('Production app was unavailable for frame freezing.');
			}
			const modules = await Promise.all([
				import('/src/core/renderer/pipeline/RenderLoop.js'),
				import('/src/core/renderer/pipeline/RenderPipeline.js')
			]);
			const { RenderLoop } = modules[0];
			const { RenderPipeline } = modules[1];
			RenderLoop.stop();
			const director = app.director;
			if (director) {
				director.stop?.();
				director.lastMs = 0;
				director.startTime = performance.now();
				if (director.sequence && typeof director.update === 'function') {
					director.update(true);
				}
				director.stop?.();
				director.lastMs = 0;
			}
			app.state.set('director_time', 0, true);
			const render = () => {
				RenderPipeline.execute(app, 0);
				return {
					realTime: 0,
					directorTime: app.director?.getElapsed?.() || 0,
					width: app.ctx.canvas?.width || app.ctx.width,
					height: app.ctx.canvas?.height || app.ctx.height
				};
			};
			window.__AWTSMOOS_REFERENCE_PROOF_RENDER__ = render;
			return { frozen: true, ...render() };
		})()`);
		if (!result?.frozen || result.realTime !== 0 || result.directorTime !== 0) {
			throw new Error('Static proof did not freeze at the canonical zero frame.');
		}
		return result;
	}
}
