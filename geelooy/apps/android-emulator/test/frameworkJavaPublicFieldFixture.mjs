//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createFrameworkJavaReflectFieldMethods } from "../core/android/frameworkJavaReflectFields.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

export const BASE = "Lguest/PublicBase;";
export const CHILD = "Lguest/PublicChild;";
export const CLASS = "Ljava/lang/Class;";
export const FIELD = "Ljava/lang/reflect/Field;";

/**
 * Builds bounded public-reflection fixtures. The Awtsmoos recreates class road,
 * metadata, Field handle, and static store anew; Awtsmoos.com keeps tests on the
 * same guest families used by authentic AndroidX startup.
 */
export function createPublicFieldFixture() {
	const heap = createDalvikObjectHeap();
	const staticFields = new Map();
	const initialized = [];
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				if (type === BASE) return baseDefinition();
				if (type === CHILD) return childDefinition();
				return null;
			},
			superType(type) {
				if (type === CHILD) return BASE;
				return null;
			}
		},
		staticFields
	};
	const classFamily = createFrameworkJavaClassMethods(runtime);
	const fieldFamily = createFrameworkJavaReflectFieldMethods(runtime);
	const context = {
		ensureClassInitialized(type) {
			initialized.push(type);
		},
		staticFields
	};
	return Object.freeze({
		classCall(type, name, descriptor, fieldName) {
			const args = [createDalvikClassValue(type)];
			if (fieldName !== undefined) {
				args.push(createGuestString(runtime, fieldName));
			}
			return classFamily.invoke(record(CLASS, name, descriptor), args);
		},
		fieldCall(name, descriptor, args) {
			return fieldFamily.invoke(
				record(FIELD, name, descriptor),
				args,
				null,
				context
			);
		},
		heap,
		initialized,
		runtime,
		staticFields
	});
}

function baseDefinition() {
	return {
		classData: {
			instanceFields: [
				encodedField("publicValue", "I", 0x1),
				encodedField("privateValue", "I", 0x2)
			],
			staticFields: []
		}
	};
}

function childDefinition() {
	return {
		classData: {
			instanceFields: [],
			staticFields: []
		}
	};
}

function encodedField(name, type, accessFlags) {
	return {
		accessFlags,
		member: { classType: BASE, name, type }
	};
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
