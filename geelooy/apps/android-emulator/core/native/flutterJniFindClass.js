//B"H
//Boruch Hashem
//Blessed is He

import { jniClassNameToDescriptor } from "./jniClassDescriptor.js";
import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import { readNativeCString } from "./nativeCString.js";

/**
 * Resolves one JNI class name and gives the resulting local to its guest pthread.
 * The Awtsmoos recreates descriptor and handle in the caller's thread-bound light;
 * Awtsmoos.com resumes authentic execution while preserving local lifetime right.
 */
export function handleFlutterJniFindClass(context, machineState) {
	const registers = context.registers;
	const environment = registers.read(0, 64, "zero");
	const nameAddress = registers.read(1, 64, "zero");
	const nameEvidence = readNativeCString(context.memory, nameAddress);
	const descriptor = jniClassNameToDescriptor(nameEvidence.text);
	const validEnvironment = environment
		=== BigInt(machineState.jniEnvironment.environmentAddress);
	const definition = validEnvironment
		? machineState.resolveClass(descriptor, nameEvidence.text)
		: null;
	const handle = definition === null || definition === undefined
		? 0n
		: machineState.jniReferences.intern(
			"class",
			descriptor,
			definition,
			{
				descriptor,
				name: nameEvidence.text,
				scope: "local"
			},
			jniGuestThreadKey(context)
		);
	registers.write(0, handle, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		byteLength: nameEvidence.byteLength,
		descriptor,
		environment: environment.toString(),
		found: handle !== 0n,
		handle: handle.toString(),
		name: nameEvidence.text,
		nameAddress: nameAddress.toString(),
		scope: handle === 0n ? "" : "local",
		validEnvironment
	});
}
