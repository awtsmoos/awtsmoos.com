// B"H
// Boruch Hashem
// Blessed is He
/** @module BundleArtifactAdapter @description Converts truthful bundle launch reports into private capability evidence. */
import { createCapabilityLevel } from '../artifacts/capabilityLevel.mjs';
import { createPrivateArtifactReport } from '../artifacts/privateArtifactReport.mjs';
import { createUnsupportedBoundary } from '../artifacts/unsupportedBoundary.mjs';

/** Creates a dependency-injected macOS bundle adapter. */
export function createBundleArtifactAdapter(nativeApi) {
	if (typeof nativeApi?.runMacosApplicationBundle !== 'function') {
		throw new TypeError('Bundle adapter requires runMacosApplicationBundle.');
	}
	return Object.freeze({
		async inspect(input, options = {}) {
			const launch = await nativeApi.runMacosApplicationBundle(input, options);
			const level = launch.execution ? 'emulated' : launch.inspection ? 'inspected' : 'unsupported';
			const capability = createCapabilityLevel({
				level,
				capability: 'macos-application-bundle',
				evidence: [launch.inspection && 'inspection', launch.execution && 'execution'].filter(Boolean),
				limitations: launch.error ? [String(launch.error.message || launch.error)] : []
			});
			const unsupported = launch.error ? createUnsupportedBoundary({
				capability: 'bundle-execution',
				reason: String(launch.error.message || launch.error),
				recoverable: false
			}) : null;
			return Object.freeze({
				launch,
				report: createPrivateArtifactReport({
					artifactHash: options.artifactHash || 'bundle-unknown',
					format: 'macos-app-bundle',
					architecture: launch.inspection?.architecture || null,
					capabilities: [capability],
					unsupported: unsupported ? [unsupported] : [],
					approvedFields: ['format', 'architecture', 'capabilities', 'unsupported']
				})
			});
		}
	});
}
