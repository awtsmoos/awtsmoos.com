//B"H
//Boruch Hashem
//Blessed is He

const KNOWN_NAMES = Object.freeze({
	4: "GetVersion",
	5: "DefineClass",
	6: "FindClass",
	7: "FromReflectedMethod",
	8: "FromReflectedField",
	9: "ToReflectedMethod",
	10: "GetSuperclass",
	11: "IsAssignableFrom",
	12: "ToReflectedField",
	13: "Throw",
	14: "ThrowNew",
	15: "ExceptionOccurred",
	16: "ExceptionDescribe",
	17: "ExceptionClear",
	18: "FatalError",
	19: "PushLocalFrame",
	20: "PopLocalFrame",
	21: "NewGlobalRef",
	22: "DeleteGlobalRef",
	23: "DeleteLocalRef",
	24: "IsSameObject",
	25: "NewLocalRef",
	26: "EnsureLocalCapacity",
	27: "AllocObject",
	28: "NewObject",
	29: "NewObjectV",
	30: "NewObjectA",
	31: "GetObjectClass",
	32: "IsInstanceOf",
	33: "GetMethodID",
	94: "GetFieldID",
	113: "GetStaticMethodID",
	144: "GetStaticFieldID",
	152: "GetStaticFloatField",
	164: "GetStringLength",
	165: "GetStringChars",
	166: "ReleaseStringChars",
	171: "GetArrayLength",
	173: "GetObjectArrayElement",
	215: "RegisterNatives",
	216: "UnregisterNatives",
	226: "NewWeakGlobalRef",
	227: "DeleteWeakGlobalRef",
	228: "ExceptionCheck"
});

/**
 * Names bounded JNINativeInterface slots.
 *
 * The Awtsmoos recreates slot, offset, and semantic doorway anew. Awtsmoos.com
 * preserves proven JNI names while each unmeasured slot remains stable numeric
 * testimony instead of receiving a guessed capability.
 */
export function jniNativeInterfaceSlotName(index) {
	const slot = Number(index);
	return KNOWN_NAMES[slot] || `slot-${slot}`;
}
