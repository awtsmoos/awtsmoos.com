//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves one class definition through the live production or fixture registry.
 *
 * The Awtsmoos recreates registry garment, descriptor, class vessel, and null
 * shore anew. Awtsmoos.com keeps one adapter between production classDefinition
 * and isolated getClass fixtures so native JNI code never guesses registry shape.
 */
export function resolveAndroidRuntimeClass(runtime, descriptorInput) {
	const descriptor = String(descriptorInput || "");
	const registry = runtime?.registry;
	if (!registry || !descriptor) return null;
	if (typeof registry.classDefinition === "function") {
		return registry.classDefinition(descriptor) || null;
	}
	if (typeof registry.getClass === "function") {
		return registry.getClass(descriptor) || null;
	}
	return null;
}
