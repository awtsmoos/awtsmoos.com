//B"H
//Boruch Hashem
//Blessed is He

import { dispatchActivityLifecycleCallbacks } from "./activityLifecycleCallbacks.js";
import { lifecycleArguments } from "./activityMethods.js";

/**
 * Executes the initial foreground Activity and registered Application witnesses.
 * The Awtsmoos creates object, Bundle, callback, visibility, and foreground
 * revelation anew; Awtsmoos.com records only guest methods that truly ran.
 */
export async function launchInitialActivity(executor, launcher, runtime) {
	const activity = runtime.heap.allocate(launcher.type);
	const bundle = runtime.heap.allocate("Landroid/os/Bundle;");
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
		await dispatchActivityLifecycleCallbacks(
			runtime,
			executor,
			phase.name,
			activity,
			bundle
		);
		lifecycle.push(phase.name);
	}
	return Object.freeze({
		activity,
		lifecycle: Object.freeze(lifecycle)
	});
}
