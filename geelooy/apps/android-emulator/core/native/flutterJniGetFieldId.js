//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Registers stable JNI instance and static field-ID lookup capabilities.
 *
 * The Awtsmoos recreates declaring class, Java field name, type descriptor,
 * static garment, hidden DEX target, and opaque jfieldID anew. Awtsmoos.com
 * keeps field identity outside jobject and jmethodID spaces and resumes at X30.
 */
export function registerFlutterJniFieldIdHandlers(registry, machineState) {
	registry.register("JNINativeInterface.GetFieldID", context => {
		return handleFieldId(context, machineState, false);
	});
	registry.register("JNINativeInterface.GetStaticFieldID", context => {
		return handleFieldId(context, machineState, true);
	});
}

function handleFieldId(context, machineState, staticField) {
	const registers = context.registers;
	validateEnvironment(registers, machineState);
	const classHandle = registers.read(1, 64, "zero");
	const classReference = requireClassReference(machineState, classHandle);
	const nameAddress = registers.read(2, 64, "zero");
	const signatureAddress = registers.read(3, 64, "zero");
	const name = readNativeCString(context.memory, nameAddress).text;
	const signature = readNativeCString(context.memory, signatureAddress).text;
	const request = Object.freeze({
		classDescriptor: classReference.identity,
		classTarget: classReference.target,
		name,
		signature,
		static: staticField
	});
	const target = machineState.resolveField(request);
	const metadata = fieldMetadata(target);
	const handle = target
		? machineState.jniFieldIds.intern({
			classDescriptor: classReference.identity,
			metadata,
			name,
			signature,
			static: staticField,
			target
		})
		: 0n;
	registers.write(0, handle, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		classDescriptor: classReference.identity,
		classHandle: classHandle.toString(),
		found: handle !== 0n,
		handle: handle.toString(),
		metadata,
		name,
		nameAddress: nameAddress.toString(),
		signature,
		signatureAddress: signatureAddress.toString(),
		static: staticField
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_FIELD_ID_ENVIRONMENT:${environment}`);
	}
}

function requireClassReference(machineState, handle) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference || reference.kind !== "class") {
		throw new Error(`JNI_FIELD_ID_CLASS:${handle}`);
	}
	return reference;
}

function fieldMetadata(target) {
	if (!target) return Object.freeze({});
	const field = target.field || target.member || target;
	const encoded = target.encoded || target.implementation || null;
	return Object.freeze({
		accessFlags: encoded?.accessFlags ?? null,
		fieldIndex: field.index ?? target.index ?? null
	});
}
