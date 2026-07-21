//B"H
//Boruch Hashem
//Blessed is He

const LONG = "Ljava/lang/Long;";

/**
 * Lists exact JNI identities backed by the pure-JavaScript Long implementation.
 *
 * The Awtsmoos recreates signed value, static garment, conversion, comparison,
 * and textual witness anew. Awtsmoos.com advertises only methods implemented by
 * frameworkJavaLongs, preserving sixty-four-bit truth through BigInt.
 */
export const FRAMEWORK_LONG_METHODS = Object.freeze([
	method("<init>", "(J)V"),
	method("valueOf", `(J)${LONG}`, true),
	method("longValue", "()J"),
	method("intValue", "()I"),
	method("shortValue", "()S"),
	method("byteValue", "()B"),
	method("floatValue", "()F"),
	method("doubleValue", "()D"),
	method("toString", "()Ljava/lang/String;"),
	method("toString", "(J)Ljava/lang/String;", true),
	method("hashCode", "()I"),
	method("hashCode", "(J)I", true),
	method("equals", "(Ljava/lang/Object;)Z"),
	method("compareTo", `(L${"java/lang/Long"};)I`),
	method("compare", "(JJ)I", true)
]);

function method(name, signature, staticMethod = false) {
	return Object.freeze({
		classDescriptor: LONG,
		implementationFamily: "frameworkJavaLongs",
		name,
		signature,
		static: staticMethod
	});
}
