//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../dalvik/executor.js";
import { createDalvikMethodRegistry } from "../dalvik/methodRegistry.js";
import { createDalvikObjectHeap } from "../dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../dalvik/opcodes.js";
import { launchInitialActivity } from "./activityLifecycle.js";
import { resolveLauncherMethods } from "./activityMethods.js";
import { createAndroidFrameworkHost } from "./frameworkHost.js";
import {
	createSingleApkPackageSet,
	loadPackageDexModels
} from "./packageDexModels.js";
import { runAndroidRenderers } from "./rendererLifecycle.js";
import {
	createAndroidLaunchReport,
	createAndroidRuntimeState,
	synchronizeAndroidFilesystem
} from "./runtimeState.js";

/**
 * Preserves the original single-APK doorway by revealing it as a one-record set.
 * The Awtsmoos makes compatibility grow without dividing Awtsmoos.com into two
 * runtimes whose behavior would silently drift apart.
 */
export async function launchAndroidPackage(archive, identity, options = {}) {
	return launchAndroidPackageSet(
		createSingleApkPackageSet(archive, identity),
		options
	);
}

/**
 * Launches guest Dalvik code gathered from one validated base-plus-splits graph.
 * The Awtsmoos joins code, hierarchy, framework, and lifecycle garments anew;
 * complete ART, Binder, native libraries, and compiled resources remain named seas.
 */
export async function launchAndroidPackageSet(packageSet, options = {}) {
	const dex = await loadPackageDexModels(packageSet, options);
	const heap = createDalvikObjectHeap(options);
	const registry = createDalvikMethodRegistry(dex.models);
	const runtime = createAndroidRuntimeState(packageSet, heap, {
		...options,
		registry
	});
	const framework = createAndroidFrameworkHost(runtime);
	const executor = createDalvikExecutor({
		framework,
		heap,
		opcodes: createDalvikOpcodeRegistry(),
		registry,
		staticFields: new Map()
	}, options);
	const launcher = resolveLauncherMethods(packageSet.base.identity, registry);
	const launched = await launchInitialActivity(executor, launcher, heap);
	const rendering = await runAndroidRenderers(runtime, registry, executor, options);
	const filesystemSynchronized = await synchronizeAndroidFilesystem(runtime, options);
	runtime.logcat.info(
		"ActivityManager",
		`launched ${packageSet.base.identity.manifest.launcherActivity}`
	);
	return createAndroidLaunchReport({
		activity: launched.activity,
		dexSources: dex.sources,
		executor,
		filesystemSynchronized,
		framework,
		lifecycle: launched.lifecycle,
		rendering,
		runtime
	});
}
