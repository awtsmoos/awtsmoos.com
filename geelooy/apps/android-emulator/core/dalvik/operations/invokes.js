//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes Dalvik fixed and range invokes through guest code or the virtual Android
 * framework. The Awtsmoos creates argument words, dispatch kind, callee, and result
 * anew; Awtsmoos.com names every unresolved method instead of inventing success.
 */
export async function executeInvokeOperation(instruction, frame, context) {
	if (!instruction.name.startsWith("invoke-")) return null;
	const record = context.registry.byIndex(context.model, instruction.index);
	const argumentsToPass = frame.registers.getMany(instruction.registers || []);
	const dispatch = invocationKind(instruction.name);
	let result;
	if (record.code) {
		result = await context.invokeGuest(record, argumentsToPass, dispatch);
	} else {
		result = await context.framework.invoke(record, argumentsToPass, dispatch, context);
	}
	frame.pendingResult = result;
	context.traceCall(Object.freeze({
		argumentCount: argumentsToPass.length,
		dispatch,
		guestCode: Boolean(record.code),
		signature: record.signature
	}));
	return Object.freeze({ handled: true });
}

function invocationKind(name) {
	if (name.startsWith("invoke-virtual")) return "virtual";
	if (name.startsWith("invoke-super")) return "super";
	if (name.startsWith("invoke-direct")) return "direct";
	if (name.startsWith("invoke-static")) return "static";
	if (name.startsWith("invoke-interface")) return "interface";
	return "unknown";
}
