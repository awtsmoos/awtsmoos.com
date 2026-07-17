//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import { createDalvikClassValue } from "./frameworkJavaClassValues.js";
import {
	convertReflectFieldRead,
	convertReflectFieldWrite,
	readJavaReflectFieldValue,
	writeJavaReflectFieldValue
} from "./frameworkJavaReflectFieldAccess.js";
import {
	isJavaReflectFieldAccessible,
	JAVA_REFLECT_FIELD,
	readJavaReflectField,
	setJavaReflectFieldAccessible
} from "./frameworkJavaReflectFieldValues.js";

/**
 * Implements java.lang.reflect.Field over DEX metadata. The Awtsmoos recreates
 * declaration, access, primitive form, and stored value anew; Awtsmoos.com keeps
 * reflection inside Dalvik class initialization, heap, and static-field vessels.
 */
export function createFrameworkJavaReflectFieldMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_REFLECT_FIELD;
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			const metadata = readJavaReflectField(runtime, args[0]);
			if (name === "getName") return createGuestString(runtime, metadata.name);
			if (name === "getType") return createDalvikClassValue(metadata.type);
			if (name === "getDeclaringClass") {
				return createDalvikClassValue(metadata.classType);
			}
			if (name === "getModifiers") return metadata.accessFlags;
			if (name === "isSynthetic") return metadata.accessFlags & 0x1000 ? 1 : 0;
			if (name === "isEnumConstant") return metadata.accessFlags & 0x4000 ? 1 : 0;
			if (name === "setAccessible") {
				return setJavaReflectFieldAccessible(runtime, args[0], args[1]);
			}
			if (name === "trySetAccessible") {
				setJavaReflectFieldAccessible(runtime, args[0], true);
				return 1;
			}
			if (name === "isAccessible") {
				return isJavaReflectFieldAccessible(runtime, args[0]);
			}
			if (name === "canAccess") return 1;
			if (name === "toString" || name === "toGenericString") {
				return fieldText(runtime, metadata);
			}
			if (name.startsWith("get")) {
				const value = await readJavaReflectFieldValue(
					runtime,
					context,
					args[0],
					args[1]
				);
				return convertReflectFieldRead(name, value);
			}
			if (name.startsWith("set")) {
				return writeJavaReflectFieldValue(
					runtime,
					context,
					args[0],
					args[1],
					convertReflectFieldWrite(name, args[2])
				);
			}
			throw reflectFieldMethodError(record.signature);
		}
	});
}

function fieldText(runtime, metadata) {
	const owner = metadata.classType.slice(1, -1).replace(/\//g, ".");
	return createGuestString(runtime, `${metadata.type} ${owner}.${metadata.name}`);
}

function reflectFieldMethodError(signature) {
	const error = new Error(`ANDROID_JAVA_REFLECT_FIELD_METHOD:${signature}`);
	error.code = "ANDROID_JAVA_REFLECT_FIELD_METHOD";
	return error;
}
