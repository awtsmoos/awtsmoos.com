//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikClassValue } from "./frameworkJavaClassValues.js";

const JAVA_CLASS = "Ljava/lang/Class;";
const INITIALIZER = "java-primitive-type-class";
const WRAPPER_TYPES = Object.freeze([
	["Ljava/lang/Boolean;", "Z"],
	["Ljava/lang/Byte;", "B"],
	["Ljava/lang/Character;", "C"],
	["Ljava/lang/Short;", "S"],
	["Ljava/lang/Integer;", "I"],
	["Ljava/lang/Long;", "J"],
	["Ljava/lang/Float;", "F"],
	["Ljava/lang/Double;", "D"],
	["Ljava/lang/Void;", "V"]
]);

/**
 * Declares canonical primitive Class tokens on Java wrapper TYPE fields. The
 * Awtsmoos creates wrapper garment, primitive essence, signature, and immutable
 * class witness anew; Awtsmoos.com never substitutes host constructors for Java law.
 */
export const JAVA_PRIMITIVE_TYPE_FIELD_GROUPS = Object.freeze(
	WRAPPER_TYPES.map(([classType, primitiveDescriptor]) => {
		return Object.freeze([
			classType,
			Object.freeze([createTypeField(classType, primitiveDescriptor)])
		]);
	})
);

const TYPE_FIELD_BY_SIGNATURE = new Map(
	JAVA_PRIMITIVE_TYPE_FIELD_GROUPS.flatMap(([, fields]) => {
		return fields.map(field => [field.signature, field]);
	})
);

/**
 * Resolves only measured wrapper TYPE metadata into bounded Dalvik class values.
 */
export function initializeJavaPrimitiveTypeStaticField(metadata) {
	const expected = TYPE_FIELD_BY_SIGNATURE.get(metadata?.signature);
	if (!expected || metadata?.frameworkInitializer !== INITIALIZER) {
		return Object.freeze({ supported: false, value: 0 });
	}
	return Object.freeze({
		supported: true,
		value: createDalvikClassValue(expected.primitiveDescriptor)
	});
}

function createTypeField(classType, primitiveDescriptor) {
	return Object.freeze({
		accessFlags: 0x19,
		classType,
		frameworkInitializer: INITIALIZER,
		name: "TYPE",
		primitiveDescriptor,
		signature: `${classType}->TYPE:${JAVA_CLASS}`,
		staticField: true,
		type: JAVA_CLASS
	});
}
