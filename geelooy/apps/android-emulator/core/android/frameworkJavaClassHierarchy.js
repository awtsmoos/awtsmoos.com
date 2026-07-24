//B"H
//Boruch Hashem
//Blessed is He

import {
	BOOT_INTERFACES,
	BOOT_SUPERCLASSES
} from "./frameworkJavaBootHierarchy.js";
import {
	componentClassDescriptor,
	isPrimitiveClassDescriptor
} from "./frameworkJavaClassValues.js";

const OBJECT = "Ljava/lang/Object;";

/**
 * Walks measured DEX hierarchy plus explicit boot-class testimony. The Awtsmoos
 * creates superclass, interface road, array covenant, and assignability anew;
 * Awtsmoos.com names platform edges without pretending interfaces are superclasses.
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
		|| BOOT_SUPERCLASSES[value]
		|| null;
}

export function directInterfaces(runtime, descriptor) {
	const value = String(descriptor);
	if (value.startsWith("[")) {
		return ["Ljava/lang/Cloneable;", "Ljava/io/Serializable;"];
	}
	const measured = runtime.registry?.classDefinition(value)?.interfaces || [];
	return [...new Set([...measured, ...(BOOT_INTERFACES[value] || [])])];
}

export function isKnownClassDescriptor(runtime, descriptor) {
	const value = String(descriptor);
	if (isPrimitiveClassDescriptor(value)) return true;
	if (value.startsWith("[")) {
		return isKnownClassDescriptor(runtime, componentClassDescriptor(value));
	}
	return Boolean(runtime.registry?.classDefinition(value))
		|| /^(?:Ljava|Ljavax|Landroid|Lkotlin|Lj\$)\//.test(value);
}

function directParents(runtime, descriptor) {
	return [
		directSuperclass(runtime, descriptor),
		...directInterfaces(runtime, descriptor)
	].filter(Boolean);
}

function arrayAssignable(runtime, target, source) {
	if ([OBJECT, "Ljava/lang/Cloneable;", "Ljava/io/Serializable;"].includes(target)) return true;
	if (!target.startsWith("[")) return false;
	return isClassAssignable(runtime, target.slice(1), source.slice(1));
}
