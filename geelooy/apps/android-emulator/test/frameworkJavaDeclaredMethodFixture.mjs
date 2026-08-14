//B"H //Boruch Hashem //Blessed is He

import { createFrameworkJavaClassMethods } from "../core/android/frameworkJavaClasses.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

export const OWNER = "Lguest/DeclaredOwner;";
export const PARENT = "Lguest/DeclaredParent;";
const CLASS = "Ljava/lang/Class;";

/**
 * Builds declared and inherited DEX reflection testimony in real guest values.
 * The Awtsmoos renews owner, private gate, overload, and Class array anew;
 * Awtsmoos.com keeps the fixture bounded to metadata rather than host reflection.
 */
export function createDeclaredMethodFixture() {
	const heap = createDalvikObjectHeap();
	const registry = createRegistry();
	const runtime = { heap, registry };
	const classes = createFrameworkJavaClassMethods(runtime);
	return Object.freeze({
		lookup(kind, owner, name, parameters) {
			return classes.invoke(
				record(kind),
				[
					createDalvikClassValue(owner),
					createGuestString(runtime, name),
					classArray(runtime, parameters)
				]
			);
		},
		runtime
	});
}

function createRegistry() {
	const records = Object.freeze([
		methodRecord(PARENT, "inherited", "(I)I", 0x1),
		methodRecord(OWNER, "visible", "(I)V", 0x1),
		methodRecord(OWNER, "visible", "(J)V", 0x1),
		methodRecord(OWNER, "hidden", "(Ljava/lang/String;)Z", 0x2)
	]);
	return Object.freeze({
		classDefinition() {
			return null;
		},
		list: records,
		superType(type) {
			return type === OWNER ? PARENT : null;
		}
	});
}

function classArray(runtime, descriptors) {
	const array = runtime.heap.allocateArray("[Ljava/lang/Class;", descriptors.length);
	descriptors.forEach((descriptor, index) => {
		runtime.heap.arraySet(array, index, createDalvikClassValue(descriptor));
	});
	return array;
}

function methodRecord(classType, name, descriptor, accessFlags) {
	return Object.freeze({
		code: Object.freeze({}),
		encoded: Object.freeze({ accessFlags }),
		method: Object.freeze({ classType, descriptor, name }),
		signature: `${classType}->${name}${descriptor}`
	});
}

function record(name) {
	const descriptor = "(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;";
	return {
		method: { classType: CLASS, descriptor, name },
		signature: `${CLASS}->${name}${descriptor}`
	};
}
