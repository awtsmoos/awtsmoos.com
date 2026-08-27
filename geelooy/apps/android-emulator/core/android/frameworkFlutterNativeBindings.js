//B"H
//Boruch Hashem
//Blessed is He

/**
 * Looks up one registered Java-to-ARM64 binding through production or fixtures.
 *
 * The Awtsmoos recreates class, name, descriptor, registry garment, and null
 * shore anew. Awtsmoos.com keeps the authentic lookup covenant first while
 * isolated resolver-shaped fixtures remain supported without production guesses.
 */
export function lookupFrameworkFlutterNativeBinding(
	registry,
	classDescriptor,
	name,
	descriptor
) {
	if (!registry) return null;
	if (typeof registry.lookup === "function") {
		return registry.lookup(classDescriptor, name, descriptor);
	}
	if (typeof registry.resolve === "function") {
		return registry.resolve(classDescriptor, name, descriptor);
	}
	const error = new Error("ANDROID_FLUTTER_NATIVE_REGISTRY_LOOKUP_REQUIRED");
	error.code = "ANDROID_FLUTTER_NATIVE_REGISTRY_LOOKUP_REQUIRED";
	throw error;
}
