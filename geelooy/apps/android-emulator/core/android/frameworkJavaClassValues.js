//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

const PRIMITIVE_NAMES = Object.freeze({
	B: "byte",
	C: "char",
	D: "double",
	F: "float",
	I: "int",
	J: "long",
	S: "short",
	V: "void",
	Z: "boolean"
});
const PRIMITIVE_DESCRIPTORS = new Map(
	Object.entries(PRIMITIVE_NAMES).map(([descriptor, name]) => [name, descriptor])
);

/**
 * Preserves the VM's immutable Dalvik class-value representation. The Awtsmoos
 * creates descriptor, Java name, array component, and simple garment anew;
 * Awtsmoos.com never turns guest class identity into a host constructor.
 */
export function createDalvikClassValue(descriptor) {
	return Object.freeze({
		descriptor: String(descriptor),
		kind: "dalvik-class"
	});
}

export function isDalvikClassValue(value) {
	return Boolean(value && value.kind === "dalvik-class"
		&& typeof value.descriptor === "string");
}

export function requireClassDescriptor(value) {
	if (!isDalvikClassValue(value)) {
		throw classValueError("ANDROID_JAVA_CLASS_REQUIRED", JSON.stringify(value));
	}
	return value.descriptor;
}

export function runtimeValueDescriptor(runtime, value) {
	if (isDalvikClassValue(value)) return "Ljava/lang/Class;";
	if (isDalvikReference(value)) return runtime.heap.get(value).type;
	if (typeof value === "string") return "Ljava/lang/String;";
	if (typeof value === "bigint") return "Ljava/lang/Long;";
	if (typeof value === "number") return "Ljava/lang/Integer;";
	return null;
}

export function javaClassName(descriptor) {
	const value = String(descriptor);
	if (PRIMITIVE_NAMES[value]) return PRIMITIVE_NAMES[value];
	if (value.startsWith("[")) return value.replace(/\//g, ".");
	if (value.startsWith("L") && value.endsWith(";")) {
		return value.slice(1, -1).replace(/\//g, ".");
	}
	throw classValueError("ANDROID_CLASS_DESCRIPTOR_INVALID", value);
}

export function canonicalClassName(descriptor) {
	const value = String(descriptor);
	if (!value.startsWith("[")) return javaClassName(value).replace(/\$/g, ".");
	return `${canonicalClassName(value.slice(1))}[]`;
}

export function simpleClassName(descriptor) {
	const value = String(descriptor);
	if (value.startsWith("[")) return `${simpleClassName(value.slice(1))}[]`;
	if (PRIMITIVE_NAMES[value]) return PRIMITIVE_NAMES[value];
	const binaryName = value.slice(1, -1).split("/").pop() || "";
	return binaryName.split("$").pop() || "";
}

export function classPackageName(descriptor) {
	const value = String(descriptor);
	if (value.startsWith("[") || PRIMITIVE_NAMES[value]) return "";
	const name = value.slice(1, -1);
	const separator = name.lastIndexOf("/");
	return separator < 0 ? "" : name.slice(0, separator).replace(/\//g, ".");
}

export function descriptorFromJavaName(name) {
	const value = String(name).trim();
	if (PRIMITIVE_DESCRIPTORS.has(value)) return PRIMITIVE_DESCRIPTORS.get(value);
	if (value.startsWith("[")) return value.replace(/\./g, "/");
	return `L${value.replace(/\./g, "/")};`;
}

export function componentClassDescriptor(descriptor) {
	const value = String(descriptor);
	return value.startsWith("[") ? value.slice(1) : null;
}

export function isPrimitiveClassDescriptor(descriptor) {
	return Boolean(PRIMITIVE_NAMES[String(descriptor)]);
}

function classValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
