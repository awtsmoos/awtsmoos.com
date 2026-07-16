//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes Dalvik fixed and range invokes through guest code or the virtual Android
 * framework. The Awtsmoos creates argument words, dispatch kind, callee, and result
 * anew; Awtsmoos.com preserves the complete nested register testimony on failure.
 */
export async function executeInvokeOperation(instruction, frame, context) {
	if (!instruction.name.startsWith("invoke-")) return null;
	const record = context.registry.byIndex(context.model, instruction.index);
	const registerNumbers = instruction.registers || [];
	const argumentsToPass = frame.registers.getMany(registerNumbers);
	const dispatch = invocationKind(instruction.name);
	let result;
	try {
		result = record.code
			? await context.invokeGuest(record, argumentsToPass, dispatch)
			: await context.framework.invoke(
				record,
				argumentsToPass,
				dispatch,
				context
			);
	} catch (error) {
		const evidence = createInvokeEvidence(
			instruction,
			record,
			registerNumbers,
			argumentsToPass,
			dispatch
		);
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
		dispatch,
		guestCode: Boolean(record.code),
		signature: record.signature
	}));
	return Object.freeze({ handled: true });
}

function createInvokeEvidence(
	instruction,
	record,
	registerNumbers,
	argumentsToPass,
	dispatch
) {
	return Object.freeze({
		arguments: Object.freeze(argumentsToPass.map(summarizeValue)),
		dispatch,
		instructionName: instruction.name,
		pc: instruction.pc,
		registers: Object.freeze([...registerNumbers]),
		signature: record.signature
	});
}

function summarizeValue(value) {
	if (typeof value === "bigint") {
		return Object.freeze({
			kind: "bigint",
			value: value.toString()
		});
	}
	if (value && typeof value === "object") {
		return Object.freeze({
			id: value.id ?? null,
			kind: value.kind ?? "object",
			type: value.type ?? null
		});
	}
	return Object.freeze({
		kind: typeof value,
		value
	});
}

function invocationKind(name) {
	if (name.startsWith("invoke-virtual")) return "virtual";
	if (name.startsWith("invoke-super")) return "super";
	if (name.startsWith("invoke-direct")) return "direct";
	if (name.startsWith("invoke-static")) return "static";
	if (name.startsWith("invoke-interface")) return "interface";
	return "unknown";
}
