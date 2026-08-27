//B"H
//Boruch Hashem
//Blessed is He

import {
	attachProviderLifecycleFailure,
	createProviderLifecycleEvidence
} from "./providerLifecycleEvidence.js";

/**
 * Executes one provider constructor, attachInfo, and onCreate in awaited order.
 * The Awtsmoos recreates guest code and framework shore as distinct vessels;
 * Awtsmoos.com routes each record honestly while preserving one causal sequence.
 */
export async function executeProviderLifecycle(input) {
	const {
		context,
		executor,
		framework,
		methods,
		provider,
		providerInfo,
		providerReference,
		runtime
	} = input;
	const sequenceStart = runtime.networkTrace.sequence;
	const phases = [];
	let phase = "constructor";
	let signature = methods.constructor.signature;
	try {
		await invokePhase(
			executor,
			framework,
			methods.constructor,
			[providerReference],
			phases,
			phase
		);
		phase = "attachInfo";
		signature = methods.attachInfo.signature;
		await invokePhase(
			executor,
			framework,
			methods.attachInfo,
			[providerReference, context, providerInfo],
			phases,
			phase
		);
		phase = "onCreate";
		signature = methods.onCreate.signature;
		const result = await invokePhase(
			executor,
			framework,
			methods.onCreate,
			[providerReference],
			phases,
			phase
		);
		return createProviderLifecycleEvidence({
			phases,
			provider,
			providerInfo,
			providerReference,
			result,
			runtime,
			sequenceStart
		});
	} catch (error) {
		throw attachProviderLifecycleFailure({
			error,
			phase,
			provider,
			runtime,
			sequenceStart,
			signature
		});
	}
}

async function invokePhase(executor, framework, record, args, phases, name) {
	const result = record.code
		? await executor.invoke(record, args)
		: await invokeFramework(framework, record, args);
	phases.push(Object.freeze({
		name,
		signature: record.signature
	}));
	return result;
}

async function invokeFramework(framework, record, args) {
	if (!framework?.invoke) {
		const error = new Error(
			`ANDROID_PROVIDER_FRAMEWORK_REQUIRED:${record.signature}`
		);
		error.code = "ANDROID_PROVIDER_FRAMEWORK_REQUIRED";
		error.signature = record.signature;
		throw error;
	}
	return framework.invoke(record, args);
}
