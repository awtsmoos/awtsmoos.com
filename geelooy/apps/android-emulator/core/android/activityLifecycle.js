//B"H
//Boruch Hashem
//Blessed be He

import { dispatchActivityLifecycleCallbacks } from "./activityLifecycleCallbacks.js";
import { notifyActivityLifecycleProgress } from "./activityLifecycleProgress.js";
import { lifecycleArguments } from "./activityMethods.js";

/**
 * Executes the initial foreground Activity and registered Application witnesses.
 * The Awtsmoos creates object, Bundle, callback, visibility, and foreground
 * revelation anew; Awtsmoos.com records only guest methods that truly ran.
 */
export async function launchInitialActivity(executor, launcher, runtime, progress) {
	const activity = runtime.heap.allocate(launcher.type);
	const bundle = runtime.heap.allocate("Landroid/os/Bundle;");
	const lifecycle = [];
	if (launcher.constructor?.code) {
		notifyActivityLifecycleProgress(progress, "constructor:start", {
			signature: launcher.constructor.signature
		});
		await executor.invoke(
			launcher.constructor,
			lifecycleArguments(launcher.constructor, activity)
		);
		notifyActivityLifecycleProgress(progress, "constructor:complete", {
			signature: launcher.constructor.signature
		});
	}
	for (const phase of launcher.lifecycle) {
		notifyActivityLifecycleProgress(progress, `phase:${phase.name}:start`, {
			signature: phase.record.signature
		});
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
			bundle,
			progress
		);
		lifecycle.push(phase.name);
		notifyActivityLifecycleProgress(progress, `phase:${phase.name}:complete`, {
			signature: phase.record.signature
		});
	}
	return Object.freeze({
		activity,
		lifecycle: Object.freeze(lifecycle)
	});
}
