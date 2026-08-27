//B"H
//Boruch Hashem
//Blessed is He

import { executeProviderLifecycle } from "./providerLifecycle.js";
import { normalizeManifestProviders } from "./providerManifest.js";
import { resolveProviderMethods } from "./providerMethods.js";
import {
	createApplicationContext,
	createProviderInfo
} from "./providerObjects.js";

/**
 * Starts every enabled manifest provider once before Activity birth. The Awtsmoos
 * recreates ordered component, shared Context, guest executor, and framework shore
 * anew; Awtsmoos.com stops at the first authentic lifecycle failure.
 */
export function createAndroidProviderDriver(input) {
	const { executor, framework, registry, runtime } = input;
	let failure = null;
	let status = "idle";
	return Object.freeze({
		async start() {
			if (status !== "idle") {
				throw providerDriverError(
					"ANDROID_PROVIDER_START_REPEATED",
					status
				);
			}
			status = "starting";
			runtime.providerStatus = status;
			try {
				const providers = normalizeManifestProviders(runtime.identity);
				const context = providers.length
					? createApplicationContext(runtime)
					: 0;
				for (const provider of providers) {
					const providerReference = runtime.heap.allocate(
						provider.descriptor
					);
					const providerInfo = createProviderInfo(runtime, provider);
					const evidence = await executeProviderLifecycle({
						context,
						executor,
						framework,
						methods: resolveProviderMethods(registry, provider),
						provider,
						providerInfo,
						providerReference,
						runtime
					});
					runtime.providerEvidence.push(evidence);
				}
				status = "started";
				runtime.providerStatus = status;
				return snapshot(runtime, status, failure);
			} catch (error) {
				failure = error.androidProvider || Object.freeze({
					message: error.message,
					phase: "driver"
				});
				status = "failed";
				runtime.providerFailure = failure;
				runtime.providerStatus = status;
				throw error;
			}
		},
		snapshot() {
			return snapshot(runtime, status, failure);
		},
		status() {
			return status;
		}
	});
}

function snapshot(runtime, status, failure) {
	return Object.freeze({
		applicationContext: runtime.applicationContext || 0,
		failure,
		providers: Object.freeze([...runtime.providerEvidence]),
		status
	});
}

function providerDriverError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
