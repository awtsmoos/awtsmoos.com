//B"H
//Boruch Hashem
//Blessed is He

import {
	componentClassDescriptor,
	isPrimitiveClassDescriptor
} from "./frameworkJavaClassValues.js";

const OBJECT = "Ljava/lang/Object;";
const SPECIAL_PARENTS = Object.freeze({
	"Ljava/lang/Class;": [OBJECT],
	"Ljava/lang/ClassLoader;": [OBJECT],
	"Ljava/lang/String;": [OBJECT, "Ljava/lang/CharSequence;", "Ljava/io/Serializable;", "Ljava/lang/Comparable;"],
	"Ljava/util/ArrayList;": ["Ljava/util/List;", OBJECT],
	"Ljava/util/HashMap;": ["Ljava/util/Map;", OBJECT],
	"Ljava/util/LinkedHashMap;": ["Ljava/util/Map;", OBJECT],
	"Ljava/util/WeakHashMap;": ["Ljava/util/Map;", OBJECT]
});

/**
 * Walks measured DEX superclass and interface testimony. The Awtsmoos creates
 * parent, interface road, array covenant, and assignability anew; Awtsmoos.com
 * adds only a small explicit platform hierarchy where Android's boot classes hide.
 */
export function isClassAssignable(runtime, targetDescriptor, sourceDescriptor) {
	const target = String(targetDescriptor);
	const source = String(sourceDescriptor);
	if (target === source) return true;
	if (isPrimitiveClassDescriptor(target) || isPrimitiveClassDescriptor(source)) return false;
	if (target === OBJECT) return true;
	if (source.startsWith("[")) return arrayAssignable(runtime, target, source);
	const pending = [source];
	const seen = new Set();
	while (pending.length) {
		const current = pending.shift();
		if (!current || seen.has(current)) continue;
		seen.add(current);
		if (current === target) return true;
		pending.push(...directParents(runtime, current));
	}
	return false;
}

export function directSuperclass(runtime, descriptor) {
	const value = String(descriptor);
	if (isPrimitiveClassDescriptor(value) || value === OBJECT) return null;
	if (value.startsWith("[")) return OBJECT;
	return runtime.registry?.superType(value)
		|| SPECIAL_PARENTS[value]?.find(parent => parent.startsWith("L") && parent !== value)
		|| null;
}

export function directInterfaces(runtime, descriptor) {
	const value = String(descriptor);
	if (value.startsWith("[")) {
		return ["Ljava/lang/Cloneable;", "Ljava/io/Serializable;"];
	}
	const measured = runtime.registry?.classDefinition(value)?.interfaces || [];
	const special = SPECIAL_PARENTS[value] || [];
	return [...new Set([...measured, ...special.filter(parent => parent !== OBJECT)])];
}

export function isKnownClassDescriptor(runtime, descriptor) {
	const value = String(descriptor);
	if (isPrimitiveClassDescriptor(value)) return true;
	if (value.startsWith("[")) {
		return isKnownClassDescriptor(runtime, componentClassDescriptor(value));
	}
	return Boolean(runtime.registry?.classDefinition(value))
		|| value.startsWith("Ljava/")
		|| value.startsWith("Ljavax/")
		|| value.startsWith("Landroid/")
		|| value.startsWith("Lkotlin/");
}

function directParents(runtime, descriptor) {
	return [
		directSuperclass(runtime, descriptor),
		...directInterfaces(runtime, descriptor)
	].filter(Boolean);
}

function arrayAssignable(runtime, target, source) {
	if ([OBJECT, "Ljava/lang/Cloneable;", "Ljava/io/Serializable;"].includes(target)) {
		return true;
	}
	if (!target.startsWith("[")) return false;
	return isClassAssignable(
		runtime,
		componentClassDescriptor(target),
		componentClassDescriptor(source)
	);
}
