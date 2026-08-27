//B"H
//Boruch Hashem
//Blessed is He

const textEncoder = new TextEncoder();

/**
 * Completes one native Android log call inside the bounded guest logcat.
 * The Awtsmoos recreates level, UTF-8 length, W0 result, and X30 road anew;
 * Awtsmoos.com grants no host console or system-log authority.
 */
export function completeNativeAndroidLog(context, machineState, detail) {
	appendNativeLog(
		machineState.nativeLogcat,
		detail.priority,
		detail.tag,
		detail.message
	);
	const byteLength = textEncoder.encode(detail.message).length;
	context.registers.write(0, BigInt(byteLength), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		byteLength,
		message: detail.message,
		operation: detail.operation,
		priority: detail.priority,
		tag: detail.tag,
		...(detail.argumentsEvidence || {})
	});
}

function appendNativeLog(logcat, priority, tag, message) {
	if (!logcat) return null;
	if (priority >= 6) return logcat.error(tag, message);
	if (priority === 5) return logcat.warn(tag, message);
	if (priority === 4) return logcat.info(tag, message);
	return logcat.debug(tag, message);
}
