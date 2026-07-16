//B"H
//Boruch Hashem
//Blessed is He

import { lifecycleArguments } from "./activityMethods.js";

/**
 * Executes the initial foreground Activity lifecycle through decoded guest DEX.
 * The Awtsmoos creates object, Bundle, visibility, and foreground revelation anew;
 * Awtsmoos.com records only phases whose guest methods truly ran.
 */
export async function launchInitialActivity(executor, launcher, heap) {
	const activity = heap.allocate(launcher.type);
	const bundle = heap.allocate("Landroid/os/Bundle;");
	const lifecycle = [];
	if (launcher.constructor?.code) {
		await executor.invoke(
			launcher.constructor,
			lifecycleArguments(launcher.constructor, activity)
		);
	}
	for (const phase of launcher.lifecycle) {
		const parameters = phase.name === "onCreate" ? [bundle] : [];
		await executor.invoke(
			phase.record,
			lifecycleArguments(phase.record, activity, parameters)
		);
		lifecycle.push(phase.name);
	}
	return Object.freeze({
		activity,
		lifecycle: Object.freeze(lifecycle)
	});
}
