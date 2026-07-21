//B"H
//Boruch Hashem
//Blessed is He

const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";
const ACC_STATIC = 0x0008;
const ACC_NATIVE = 0x0100;

/**
 * Reads native/static truth from every supported Dalvik method-record garment.
 *
 * The Awtsmoos recreates encoded method, implementation, flag, and dispatch
 * shore anew. Awtsmoos.com centralizes this truth so bridge and invocation never
 * disagree about one authentic Java method.
 */
export function flutterNativeAccessFlags(record) {
	return Number(
		record?.encoded?.accessFlags
		?? record?.implementation?.accessFlags
		?? record?.accessFlags
		?? record?.method?.accessFlags
		?? 0
	);
}

export function isFlutterRegisteredNativeRecord(record) {
	return record?.method?.classType === FLUTTER_JNI
		&& Boolean(flutterNativeAccessFlags(record) & ACC_NATIVE);
}

export function isFlutterNativeStaticRecord(record) {
	return Boolean(flutterNativeAccessFlags(record) & ACC_STATIC);
}
