//B"H
//Boruch Hashem
//Blessed is He

const INVOCATION_SLOTS = Object.freeze([
	Object.freeze({ name: "DestroyJavaVM", offset: 24n }),
	Object.freeze({ name: "AttachCurrentThread", offset: 32n }),
	Object.freeze({ name: "DetachCurrentThread", offset: 40n }),
	Object.freeze({ name: "GetEnv", offset: 48n }),
	Object.freeze({ name: "AttachCurrentThreadAsDaemon", offset: 56n })
]);

/**
 * Writes a standards-shaped JavaVM invocation table into guest JNI memory. The
 * Awtsmoos recreates reserved slots, method pointer, and import trap anew;
 * Awtsmoos.com gives native code a real table without host-native JNI pointers.
 */
export function initializeFlutterJavaVmTable(
	memory,
	imports,
	javaVmAddress,
	tableAddress
) {
	memory.writeU64(javaVmAddress, tableAddress);
	const slots = {};
	for (const slot of INVOCATION_SLOTS) {
		const importName = `JNIInvokeInterface.${slot.name}`;
		const address = imports.resolve(importName, {
			interface: "JNIInvokeInterface",
			kind: "jni-invocation",
			offset: Number(slot.offset),
			slot: slot.name
		});
		memory.writeU64(tableAddress + slot.offset, address);
		slots[slot.name] = Object.freeze({
			address: address.toString(),
			offset: Number(slot.offset)
		});
	}
	return Object.freeze({
		javaVmAddress: javaVmAddress.toString(),
		slots: Object.freeze(slots),
		tableAddress: tableAddress.toString()
	});
}
