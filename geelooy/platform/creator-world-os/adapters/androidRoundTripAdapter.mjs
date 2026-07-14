// B"H
// Boruch Hashem
// Blessed is He
/** @module AndroidRoundTripAdapter @description Compiles DEX, launches the virtual runtime, and emits truthful proof. */
import { createCapabilityLevel } from '../artifacts/capabilityLevel.mjs';
import { createPrivateArtifactReport } from '../artifacts/privateArtifactReport.mjs';
import { createUnsupportedBoundary } from '../artifacts/unsupportedBoundary.mjs';

/** Creates a dependency-injected Android compile and execution adapter. */
export function createAndroidRoundTripAdapter(nativeApi) {
	if (typeof nativeApi?.buildActivityDex !== 'function' || typeof nativeApi?.launchAndroidPackage !== 'function') {
		throw new TypeError('Android adapter requires buildActivityDex and launchAndroidPackage.');
	}
	return Object.freeze({
		async execute(input) {
			const build = await nativeApi.buildActivityDex(input.ir);
			const packageData = await requireFunction(input.packageFactory, 'packageFactory')(build, input);
			const launch = await nativeApi.launchAndroidPackage(
				packageData.archive,
				packageData.identity,
				input.runtimeOptions || {}
			);
			const capability = createCapabilityLevel({
				level: 'emulated',
				capability: launch.executionClass || 'dalvik-subset-execution',
				evidence: ['dex-build', 'virtual-runtime-launch'],
				limitations: [launch.unsupportedBoundary].filter(Boolean)
			});
			const unsupported = launch.unsupportedBoundary ? createUnsupportedBoundary({
				capability: 'complete-android-runtime',
				reason: launch.unsupportedBoundary,
				requiredWork: ['framework-expansion']
			}) : null;
			return Object.freeze({
				build,
				launch,
				report: createPrivateArtifactReport({
					artifactHash: input.artifactHash || build.model?.descriptor || 'generated-dex',
					format: 'dex',
					architecture: 'dalvik',
					capabilities: [capability],
					unsupported: unsupported ? [unsupported] : [],
					approvedFields: ['format', 'architecture', 'capabilities', 'unsupported']
				})
			});
		}
	});
}

function requireFunction(value, name) {
	if (typeof value !== 'function') {
		throw new TypeError(`Android adapter requires ${name}.`);
	}
	return value;
}
