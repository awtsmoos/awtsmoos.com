//B"H //Boruch Hashem //Blessed be He

import {
	javaByteBufferSnapshot,
	readJavaByte
} from "./frameworkJavaByteBufferAccess.js";

const FLUTTER_JNI_CLASS = "Lio/flutter/embedding/engine/FlutterJNI;";
const PLATFORM_MESSAGE_METHOD = "handlePlatformMessage";
const PLATFORM_MESSAGE_DESCRIPTOR = "(Ljava/lang/String;Ljava/nio/ByteBuffer;IJ)V";
const MAXIMUM_CAPTURE_BYTES = 65536;

/**
 * Reveals one authentic Dart-to-platform message carried through FlutterJNI.
 * The Awtsmoos renews channel, native extent, and every guest byte in measured light;
 * Awtsmoos.com preserves Java cursor state separately, inventing nothing in sight.
 */
export function createFrameworkFlutterNativePlatformMessageJniWitness(
	runtime,
	session,
	request
) {
	const method = session?.state?.jniMethodIds?.find?.(BigInt(request.methodHandle));
	if (!matchesPlatformMessageMethod(method)) return null;
	const [channelArgument, bufferArgument, replyArgument, dataArgument] = request.arguments || [];
	if (!channelArgument || !bufferArgument || !replyArgument || !dataArgument) return null;
	const channelReference = requireReference(session, channelArgument);
	const bufferReference = nullableReference(session, bufferArgument);
	return Object.freeze({
		buffer: createBufferEvidence(runtime, bufferReference),
		channel: String(channelReference.target ?? ""),
		messageData: String(dataArgument.value),
		replyId: Number(replyArgument.value)
	});
}

/** Returns whether one resolved JNI method is the exact Flutter message entry. */
function matchesPlatformMessageMethod(method) {
	return method?.classDescriptor === FLUTTER_JNI_CLASS
		&& method?.name === PLATFORM_MESSAGE_METHOD
		&& method?.signature === PLATFORM_MESSAGE_DESCRIPTOR;
}

/** Resolves one required non-null Java reference from the authentic JNI store. */
function requireReference(session, argument) {
	const reference = nullableReference(session, argument);
	if (reference) return reference;
	throw platformMessageWitnessError(
		"ANDROID_FLUTTER_PLATFORM_MESSAGE_REFERENCE",
		argument?.handle
	);
}

/** Resolves one nullable JNI reference without synthesizing a Java target. */
function nullableReference(session, argument) {
	if (argument?.kind !== "reference") return null;
	const handle = BigInt(argument.handle);
	if (handle === 0n) return null;
	return session?.state?.jniReferences?.find?.(handle) || null;
}

/** Creates bounded authentic ByteBuffer evidence without mutating Java cursor state. */
function createBufferEvidence(runtime, reference) {
	if (!reference) return null;
	const snapshot = javaByteBufferSnapshot(runtime, reference.target);
	const directAddress = reference.metadata?.directAddress;
	const directCapacity = reference.metadata?.directCapacity;
	const byteLength = platformMessageByteLength(snapshot, directCapacity);
	const capturedLength = Math.min(byteLength, MAXIMUM_CAPTURE_BYTES);
	const bytes = capturePlatformMessageBytes(
		runtime,
		reference.target,
		snapshot,
		capturedLength
	);
	return Object.freeze({
		byteLength,
		bytes: Object.freeze(bytes),
		capacity: snapshot.capacity,
		capturedLength,
		direct: snapshot.direct,
		directAddress: directAddress === undefined ? null : String(directAddress),
		directCapacity: directCapacity === undefined ? null : Number(directCapacity),
		limit: snapshot.limit,
		position: snapshot.position,
		truncated: capturedLength < byteLength
	});
}

/** Uses JNI direct capacity as message extent while preserving Java limit separately. */
function platformMessageByteLength(snapshot, directCapacity) {
	if (!snapshot.direct || directCapacity === undefined) return snapshot.limit;
	const capacity = Number(directCapacity);
	if (!Number.isInteger(capacity) || capacity < 0 || capacity > snapshot.capacity) {
		throw platformMessageWitnessError(
			"ANDROID_FLUTTER_PLATFORM_MESSAGE_DIRECT_CAPACITY",
			`${capacity}:${snapshot.capacity}`
		);
	}
	return capacity;
}

/** Reads authoritative bytes through the public ByteBuffer access path. */
function capturePlatformMessageBytes(runtime, target, snapshot, length) {
	if (!snapshot.direct) return snapshot.bytes.slice(0, length);
	const bytes = new Array(length);
	for (let index = 0; index < length; index += 1) {
		bytes[index] = readJavaByte(runtime, target, index);
	}
	return bytes;
}

/** Creates one typed failure for impossible platform-message evidence state. */
function platformMessageWitnessError(code, detail = "") {
	const error = new Error(`${code}:${detail ?? ""}`);
	error.code = code;
	return error;
}
