//B"H
//Boruch Hashem
//Blessed is He

export const BASE = "Lguest/ReflectBase;";
export const CHILD = "Lguest/ReflectChild;";

/**
 * Declares a bounded DEX method universe for reflection tests. The Awtsmoos
 * recreates public target, hidden target, signature lookup, and superclass road
 * anew; Awtsmoos.com keeps fake registry evidence outside the runtime fixture.
 */
export function createReflectMethodRegistry() {
	const records = Object.freeze([
		methodRecord(BASE, "answer", "(I)I", 0x1),
		methodRecord(BASE, "hidden", "(I)I", 0x2)
	]);
	return Object.freeze({
		bySignature(signature) {
			return records.find(record => record.signature === signature) || null;
		},
		classDefinition() {
			return null;
		},
		list: records,
		superType(type) {
			return type === CHILD ? BASE : null;
		}
	});
}

function methodRecord(classType, name, descriptor, accessFlags) {
	return Object.freeze({
		code: Object.freeze({}),
		encoded: Object.freeze({ accessFlags }),
		method: Object.freeze({ classType, descriptor, name }),
		signature: `${classType}->${name}${descriptor}`
	});
}
