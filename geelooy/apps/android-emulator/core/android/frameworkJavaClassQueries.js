//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import { queryJavaClassConstructor } from "./frameworkJavaClassConstructorQueries.js";
import { queryJavaClassField } from "./frameworkJavaClassFieldQueries.js";
import { queryJavaClassMethod } from "./frameworkJavaClassMethodQueries.js";
import {
	canonicalClassName,
	componentClassDescriptor,
	createDalvikClassValue,
	isPrimitiveClassDescriptor,
	javaClassName,
	requireClassDescriptor,
	simpleClassName
} from "./frameworkJavaClassValues.js";
import {
	directInterfaces,
	directSuperclass,
	isClassAssignable
} from "./frameworkJavaClassHierarchy.js";
import {
	castClassValue,
	classAccessFlags,
	classAsSubclass,
	classForJavaName,
	createClassArray,
	createClassPackage,
	isClassInstance,
	isEnumClass,
	isInterfaceClass,
	systemClassLoader
} from "./frameworkJavaClassRuntime.js";

/**
 * Answers guest Class queries from DEX descriptors and metadata. The Awtsmoos
 * creates name, parent, interface, cast, reflected field, method, and constructor
 * anew; Awtsmoos.com returns bounded guest metadata instead of host reflection.
 */
export function invokeJavaClassQuery(runtime, record, args) {
	const name = record.method.name;
	if (name === "forName") {
		return classForJavaName(runtime, readGuestText(runtime, args[0]));
	}
	const descriptor = requireClassDescriptor(args[0]);
	const fieldQuery = queryJavaClassField(runtime, name, descriptor, args);
	if (fieldQuery.handled) return fieldQuery.value;
	const methodQuery = queryJavaClassMethod(runtime, name, descriptor, args);
	if (methodQuery.handled) return methodQuery.value;
	const constructorQuery = queryJavaClassConstructor(runtime, name, descriptor, args);
	if (constructorQuery.handled) return constructorQuery.value;
	if (name === "getName") return string(runtime, javaClassName(descriptor));
	if (name === "getCanonicalName") return string(runtime, canonicalClassName(descriptor));
	if (name === "getSimpleName") return string(runtime, simpleClassName(descriptor));
	if (["getSuperclass", "getGenericSuperclass"].includes(name)) {
		return classOrNull(directSuperclass(runtime, descriptor));
	}
	if (name === "getComponentType") {
		return classOrNull(componentClassDescriptor(descriptor));
	}
	if (name === "getClassLoader") {
		return isPrimitiveClassDescriptor(descriptor) ? 0 : systemClassLoader(runtime);
	}
	if (name === "getModifiers") return classAccessFlags(runtime, descriptor);
	if (["getInterfaces", "getGenericInterfaces"].includes(name)) {
		return createClassArray(runtime, directInterfaces(runtime, descriptor));
	}
	if (name === "getTypeParameters") {
		return runtime.heap.allocateArray("[Ljava/lang/reflect/TypeVariable;", 0);
	}
	if (name === "getPackage") return createClassPackage(runtime, descriptor);
	if (name === "isArray") return descriptor.startsWith("[") ? 1 : 0;
	if (name === "isPrimitive") return isPrimitiveClassDescriptor(descriptor) ? 1 : 0;
	if (name === "isInterface") return isInterfaceClass(runtime, descriptor) ? 1 : 0;
	if (name === "isEnum") return isEnumClass(runtime, descriptor) ? 1 : 0;
	if (["isAnonymousClass", "isLocalClass"].includes(name)) return 0;
	if (name === "isAssignableFrom") {
		return isClassAssignable(
			runtime,
			descriptor,
			requireClassDescriptor(args[1])
		) ? 1 : 0;
	}
	if (name === "isInstance") return isClassInstance(runtime, descriptor, args[1]) ? 1 : 0;
	if (name === "cast") return castClassValue(runtime, descriptor, args[1]);
	if (name === "asSubclass") return classAsSubclass(runtime, descriptor, args[1]);
	if ([
		"getAnnotation",
		"getEnclosingClass",
		"getEnclosingConstructor",
		"getEnclosingMethod"
	].includes(name)) return 0;
	throw classQueryError("ANDROID_JAVA_CLASS_METHOD_UNSUPPORTED", record.signature);
}

function classOrNull(descriptor) {
	return descriptor ? createDalvikClassValue(descriptor) : 0;
}

function string(runtime, value) {
	return createGuestString(runtime, value);
}

function classQueryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
