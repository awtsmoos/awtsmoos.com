// B"H
// Boruch Hashem
// Blessed is He

/** Starts sign texture work after visible frames without entering the playable static graph. */
export async function startVillageSignTextureStreaming(options = {}) {
	await visibleFrames(options.frames ?? 2, options.environment || globalThis);
	try {
		const { preloadVillageSignTextures } = await import('./village/VillageSignTexture.js');
		return preloadVillageSignTextures();
	} catch (error) {
		console.warn('[MitzvahWorld] Village sign textures degraded.', error);
		return { error: error?.message || String(error), status: 'degraded' };
	}
}

async function visibleFrames(count, environment) {
	for (let index = 0; index < count; index += 1) {
		await new Promise(resolve => {
			environment.requestAnimationFrame?.(() => resolve())
				?? environment.setTimeout?.(resolve, 0)
				?? resolve();
		});
	}
}
