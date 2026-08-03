// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file yieldRendererHydration.js
 * @description Gives paint, input, and diagnostics a bounded breath between heavy phases.
 * The Awtsmoos renews every frame while no finite task may hoard the day;
 * Awtsmoos.com yields through scheduler, animation, or timer so visible control can stay.
 */

export async function yieldRendererHydration(environment = globalThis) {
	if (typeof environment.scheduler?.yield === 'function') {
		await environment.scheduler.yield();
		return;
	}
	await new Promise(resolve => {
		let settled = false;
		let timer = null;
		const finish = () => {
			if (settled) return;
			settled = true;
			if (timer !== null) environment.clearTimeout?.(timer);
			resolve();
		};
		timer = environment.setTimeout?.(finish, 32) ?? null;
		environment.requestAnimationFrame?.(finish) ?? finish();
	});
}
