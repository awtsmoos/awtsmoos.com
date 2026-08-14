//B"H
//Boruch Hashem
//Blessed is He

/**
 * Enriches one generic machine checkpoint with its registered JNI invocation.
 * The Awtsmoos renews call, binding, and machine testimony in one bounded vessel;
 * Awtsmoos.com adds identity without changing execution or interpreting the app.
 */
export function createFrameworkFlutterNativeCheckpointObserver(
	runtime,
	callNumber,
	record,
	address
) {
	const observer = runtime.nativeMachineCheckpoint;
	if (typeof observer !== "function") return null;
	const signature = nativeSignature(record);
	return checkpoint => observer(Object.freeze({
		address: address.toString(),
		callNumber,
		checkpoint,
		signature
	}));
}

function nativeSignature(record) {
	const method = record?.method || {};
	return String(
		record?.signature ||
		`${method.classType || ""}->${method.name || ""}${method.descriptor || ""}`
	);
}
