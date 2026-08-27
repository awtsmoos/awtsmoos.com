//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";

const BYTE_ORDER = "Ljava/nio/ByteOrder;";
const NAME_FIELD = "java:nio:byte-order:name";
const BIG_ENDIAN = "BIG_ENDIAN";
const LITTLE_ENDIAN = "LITTLE_ENDIAN";

/**
 * Implements immutable Java NIO byte-order singletons. The Awtsmoos creates byte,
 * native arrangement, identity, and canonical name anew; Awtsmoos.com measures
 * the host typed-array order instead of assuming the machine beneath the browser.
 */
export function createFrameworkJavaByteOrderMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === BYTE_ORDER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "nativeOrder") return nativeByteOrder(runtime);
			if (name === "toString") {
				return createGuestString(
					runtime,
					byteOrderMetadata(runtime, args[0]).name
				);
			}
			if (name === "equals") return sameReference(args[0], args[1]) ? 1 : 0;
			if (name === "hashCode") return args[0]?.id | 0;
			throw byteOrderError(
				"ANDROID_JAVA_BYTE_ORDER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

/**
 * Returns the immutable native-order singleton after measuring typed-array bytes.
 */
export function nativeByteOrder(runtime) {
	const singletons = byteOrderSingletons(runtime);
	return hostIsLittleEndian()
		? singletons.littleEndian
		: singletons.bigEndian;
}

/**
 * Exposes canonical order metadata for future ByteBuffer and codec capabilities.
 */
export function byteOrderMetadata(runtime, reference) {
	const object = runtime.heap.get(reference);
	const name = runtime.heap.getField(reference, NAME_FIELD);
	if (object.type !== BYTE_ORDER
		|| ![BIG_ENDIAN, LITTLE_ENDIAN].includes(name)) {
		throw byteOrderError(
			"ANDROID_JAVA_BYTE_ORDER_UNINITIALIZED",
			object.type
		);
	}
	return Object.freeze({
		littleEndian: name === LITTLE_ENDIAN,
		name
	});
}

export function byteOrderSingletons(runtime) {
	if (!runtime.byteOrderSingletons) {
		runtime.byteOrderSingletons = Object.freeze({
			bigEndian: createByteOrder(runtime, BIG_ENDIAN),
			littleEndian: createByteOrder(runtime, LITTLE_ENDIAN)
		});
	}
	return runtime.byteOrderSingletons;
}

function createByteOrder(runtime, name) {
	return runtime.heap.allocate(BYTE_ORDER, {
		[NAME_FIELD]: name
	});
}

function hostIsLittleEndian() {
	const bytes = new Uint8Array(new Uint16Array([0x0102]).buffer);
	return bytes[0] === 0x02;
}

function sameReference(left, right) {
	return left?.kind === "dalvik-reference"
		&& right?.kind === left.kind
		&& left.id === right.id;
}

function byteOrderError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
