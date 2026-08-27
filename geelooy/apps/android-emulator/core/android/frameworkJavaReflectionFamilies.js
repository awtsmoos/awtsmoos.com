//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaReflectConstructorMethods } from "./frameworkJavaReflectConstructors.js";
import { JAVA_REFLECT_CONSTRUCTOR } from "./frameworkJavaReflectConstructorValues.js";
import { createFrameworkJavaReflectFieldMethods } from "./frameworkJavaReflectFields.js";
import { JAVA_REFLECT_FIELD } from "./frameworkJavaReflectFieldValues.js";
import { createFrameworkJavaReflectMethodMethods } from "./frameworkJavaReflectMethods.js";
import { JAVA_REFLECT_METHOD } from "./frameworkJavaReflectMethodValues.js";

const JAVA_ACCESSIBLE_OBJECT = "Ljava/lang/reflect/AccessibleObject;";

/**
 * Routes shared AccessibleObject methods by verified guest reflection garment.
 * The Awtsmoos recreates Field, Method, Constructor, and inherited doorway anew;
 * Awtsmoos.com never lets one reflection handle impersonate another.
 */
export function createFrameworkJavaReflectionMethods(runtime) {
	const constructors = createFrameworkJavaReflectConstructorMethods(runtime);
	const fields = createFrameworkJavaReflectFieldMethods(runtime);
	const methods = createFrameworkJavaReflectMethodMethods(runtime);
	return Object.freeze({
		canHandle(record) {
			return constructors.canHandle(record)
				|| fields.canHandle(record)
				|| methods.canHandle(record);
		},
		invoke(record, args, dispatch, context) {
			const classType = record.method.classType;
			if (classType === JAVA_REFLECT_CONSTRUCTOR) {
				return constructors.invoke(record, args, dispatch, context);
			}
			if (classType === JAVA_REFLECT_METHOD) {
				return methods.invoke(record, args, dispatch, context);
			}
			if (classType === JAVA_REFLECT_FIELD) {
				return fields.invoke(record, args, dispatch, context);
			}
			if (classType === JAVA_ACCESSIBLE_OBJECT) {
				return invokeAccessible(runtime, constructors, fields, methods, record, args, dispatch, context);
			}
			throw reflectionError(record.signature);
		}
	});
}

function invokeAccessible(runtime, constructors, fields, methods, record, args, dispatch, context) {
	const receiverType = runtime.heap.get(args[0]).type;
	if (receiverType === JAVA_REFLECT_CONSTRUCTOR) {
		return constructors.invoke(record, args, dispatch, context);
	}
	if (receiverType === JAVA_REFLECT_METHOD) {
		return methods.invoke(record, args, dispatch, context);
	}
	if (receiverType === JAVA_REFLECT_FIELD) {
		return fields.invoke(record, args, dispatch, context);
	}
	throw reflectionError(`${record.signature}:${receiverType}`);
}

function reflectionError(signature) {
	const error = new Error(`ANDROID_JAVA_REFLECTION_METHOD:${signature}`);
	error.code = "ANDROID_JAVA_REFLECTION_METHOD";
	return error;
}
