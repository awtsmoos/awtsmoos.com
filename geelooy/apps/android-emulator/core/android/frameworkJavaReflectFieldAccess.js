//B"H
//Boruch Hashem
//Blessed is He

import { initializeFrameworkStaticField } from "./frameworkJavaFrameworkFields.js";
import { readJavaReflectField } from "./frameworkJavaReflectFieldValues.js";

/**
 * Reads and writes reflected fields through Dalvik storage. The Awtsmoos
 * recreates class awakening, target, canonical key, and primitive garment anew;
 * Awtsmoos.com never redirects guest reflection into JavaScript property access.
 */
export async function readJavaReflectFieldValue(
	runtime,
	context,
	fieldReference,
	target
) {
	const metadata = readJavaReflectField(runtime, fieldReference);
	if (metadata.staticField) {
		await ensureReflectClass(context, metadata.classType);
		const staticFields = requireStaticFields(context);
		if (!staticFields.has(metadata.signature)) {
			const initialized = initializeFrameworkStaticField(runtime, metadata);
			if (initialized.supported) {
				staticFields.set(metadata.signature, initialized.value);
			}
		}
		return staticFields.get(metadata.signature) ?? 0;
	}
	return runtime.heap.getField(target, metadata.signature);
}

export async function writeJavaReflectFieldValue(
	runtime,
	context,
	fieldReference,
	target,
	value
) {
	const metadata = readJavaReflectField(runtime, fieldReference);
	if (metadata.staticField) {
		await ensureReflectClass(context, metadata.classType);
		requireStaticFields(context).set(metadata.signature, value);
		return;
	}
	runtime.heap.setField(target, metadata.signature, value);
}

export function convertReflectFieldRead(name, value) {
	if (name === "get") return value;
	if (name === "getBoolean") return value ? 1 : 0;
	if (name === "getByte") return Number(value) << 24 >> 24;
	if (name === "getChar") return Number(value) & 0xffff;
	if (name === "getShort") return Number(value) << 16 >> 16;
	if (name === "getInt") return Number(value) | 0;
	if (name === "getLong") return BigInt(value);
	if (["getFloat", "getDouble"].includes(name)) return Number(value);
	throw reflectAccessError("ANDROID_JAVA_REFLECT_FIELD_GET", name);
}

export function convertReflectFieldWrite(name, value) {
	if (name === "set") return value;
	if (name === "setBoolean") return value ? 1 : 0;
	if (name === "setByte") return Number(value) << 24 >> 24;
	if (name === "setChar") return Number(value) & 0xffff;
	if (name === "setShort") return Number(value) << 16 >> 16;
	if (name === "setInt") return Number(value) | 0;
	if (name === "setLong") return BigInt(value);
	if (["setFloat", "setDouble"].includes(name)) return Number(value);
	throw reflectAccessError("ANDROID_JAVA_REFLECT_FIELD_SET", name);
}

async function ensureReflectClass(context, classType) {
	if (typeof context?.ensureClassInitialized === "function") {
		await context.ensureClassInitialized(classType);
	}
}

function requireStaticFields(context) {
	if (!(context?.staticFields instanceof Map)) {
		throw reflectAccessError(
			"ANDROID_JAVA_REFLECT_STATIC_FIELDS_REQUIRED",
			"executor-context"
		);
	}
	return context.staticFields;
}

function reflectAccessError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
