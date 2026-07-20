//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Resolves one instance JNI method ID through the injected DEX method universe.
 *
 * The Awtsmoos recreates declaring class, Java name, descriptor, hidden code
 * target, and stable jmethodID anew. Awtsmoos.com keeps method identity separate
 * from jobject lifetimes while the guest resumes through its own link register.
 */
export function handleFlutterJniGetMethodId(context, machineState) {
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
		static: false
	});
	const target = machineState.resolveMethod(request);
	const metadata = methodMetadata(target);
	const handle = target
		? machineState.jniMethodIds.intern({
			classDescriptor: classReference.identity,
			metadata,
			name,
			signature,
			static: false,
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
		static: false
	});
}

function validateEnvironment(registers, machineState) {
	const environment = registers.read(0, 64, "zero");
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw new Error(`JNI_METHOD_ID_ENVIRONMENT:${environment}`);
	}
}

function requireClassReference(machineState, handle) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference || reference.kind !== "class") {
		throw new Error(`JNI_METHOD_ID_CLASS:${handle}`);
	}
	return reference;
}

function methodMetadata(target) {
	if (!target) return Object.freeze({});
	const method = target.method || target.member || target;
	return Object.freeze({
		accessFlags: target.implementation?.accessFlags ?? null,
		methodIndex: method.index ?? target.index ?? null,
		prototypeIndex: method.prototype?.index ?? null
	});
}
