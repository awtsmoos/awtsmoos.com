//B"H
//Boruch Hashem
//Blessed is He

import { resolveDalvikInvocation } from "../methodDispatch.js";
import { createDalvikInvokeEvidence } from "./invokeEvidence.js";

/**
 * Executes fixed and range invokes through initialized static classes,
 * receiver-resolved guest code, or the explicit Android framework. The Awtsmoos
 * creates declaration, class awakening, override, call word, and result anew;
 * Awtsmoos.com preserves historic and rich resolved-road testimony together.
 */
export async function executeInvokeOperation(instruction, frame, context) {
	if (!instruction.name.startsWith("invoke-")) return null;
	const declared = context.registry.byIndex(context.model, instruction.index);
	const registerNumbers = instruction.registers || [];
	const argumentsToPass = frame.registers.getMany(registerNumbers);
	const dispatch = invocationKind(instruction.name);
	let resolved = null;
	let result;
	try {
		if (dispatch === "static") {
			await context.ensureClassInitialized(declared.method.classType);
		}
		resolved = resolveDalvikInvocation(
			declared,
			argumentsToPass,
			dispatch,
			context
		);
		result = await invokeResolved(
			resolved.record,
			argumentsToPass,
			dispatch,
			context
		);
	} catch (error) {
		const evidence = createDalvikInvokeEvidence({
			argumentsToPass,
			context,
			declared,
			dispatch,
			instruction,
			registerNumbers,
			resolved
		});
		if (!error.dalvikInvoke) error.dalvikInvoke = evidence;
		const chain = Array.isArray(error.dalvikInvokeChain)
			? [...error.dalvikInvokeChain]
			: [];
		chain.push(evidence);
		error.dalvikInvokeChain = Object.freeze(chain);
		throw error;
	}
	frame.pendingResult = result;
	context.traceCall(Object.freeze({
		argumentCount: argumentsToPass.length,
		declaredSignature: declared.signature,
		dispatch,
		guestCode: Boolean(resolved.record.code),
		receiverType: resolved.receiverType,
		resolution: resolved.reason,
		resolvedSignature: resolved.record.signature,
		signature: resolved.record.signature
	}));
	return Object.freeze({ handled: true });
}

async function invokeResolved(record, args, dispatch, context) {
	if (record.code) {
		return context.invokeGuest(record, args, dispatch);
	}
	return context.framework.invoke(
		record,
		args,
		dispatch,
		context
	);
}

function invocationKind(name) {
	for (const kind of [
		"virtual",
		"super",
		"direct",
		"static",
		"interface"
	]) {
		if (name.startsWith(`invoke-${kind}`)) return kind;
	}
	return "unknown";
}
