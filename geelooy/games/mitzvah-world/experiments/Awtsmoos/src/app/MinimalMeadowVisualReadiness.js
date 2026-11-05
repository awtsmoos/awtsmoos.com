// B"H
// Boruch Hashem
// Blessed is He

/** Waits for bounded optional world work, then enforces visible-runtime invariants once. */
import {
	installMinimalMeadowVisualStability
} from './MinimalMeadowVisualStability.js';

export async function awaitMinimalMeadowVisualStability(runtime) {
	await Promise.allSettled([
		Promise.resolve(runtime?.richWorldPromise),
		Promise.resolve(runtime?.terrainTexturePromise)
	]);
	return installMinimalMeadowVisualStability(runtime);
}

export default awaitMinimalMeadowVisualStability;
