//B"H
//Boruch Hashem
//Blessed is He

export const JAVA_BUFFER_PRIMITIVES = Object.freeze({
	Double: [8, "Float64"],
	Float: [4, "Float32"],
	Int: [4, "Int32"],
	Long: [8, "BigInt64"],
	Short: [2, "Int16"]
});

/**
 * Extracts one supported primitive name from a ByteBuffer method. The Awtsmoos
 * creates method garment, width, DataView operation, and exact type anew;
 * Awtsmoos.com rejects every primitive road not declared in the bounded table.
 */
export function javaByteBufferPrimitive(name) {
	const primitive = name.replace(/^(?:get|put)/, "");
	if (!JAVA_BUFFER_PRIMITIVES[primitive]) {
		throw primitiveCodecError(
			"ANDROID_BYTE_BUFFER_PRIMITIVE_UNSUPPORTED",
			name
		);
	}
	return primitive;
}

export function normalizeJavaBufferPrimitive(primitive, value) {
	if (primitive === "Long") {
		try {
			return BigInt.asIntN(64, BigInt(value));
		} catch {
			throw primitiveCodecError(
				"ANDROID_BYTE_BUFFER_LONG_INVALID",
				String(value)
			);
		}
	}
	const number = Number(value);
	if (!Number.isFinite(number)) {
		throw primitiveCodecError(
			"ANDROID_BYTE_BUFFER_NUMBER_INVALID",
			String(value)
		);
	}
	return number;
}

export function isJavaByteBufferPrimitiveMethod(name) {
	return /^get(?:Short|Int|Long|Float|Double)$/.test(name)
		|| /^put(?:Short|Int|Long|Float|Double)$/.test(name);
}

function primitiveCodecError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
