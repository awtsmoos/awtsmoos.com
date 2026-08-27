//B"H
//Boruch Hashem
//Blessed is He

export const SUN_MISC_UNSAFE = "Lsun/misc/Unsafe;";
const INITIALIZER = "sun-misc-unsafe-singleton";
const SINGLETONS = new WeakMap();

export const SUN_MISC_UNSAFE_FIELDS = Object.freeze([
	Object.freeze({
		accessFlags: 0x1a,
		classType: SUN_MISC_UNSAFE,
		frameworkInitializer: INITIALIZER,
		name: "theUnsafe",
		signature: `${SUN_MISC_UNSAFE}->theUnsafe:${SUN_MISC_UNSAFE}`,
		staticField: true,
		type: SUN_MISC_UNSAFE
	})
]);

/**
 * Reveals one powerless guest marker for sun.misc.Unsafe. The Awtsmoos creates
 * singleton, class garment, reflected field, and stable identity anew;
 * Awtsmoos.com grants no pointer, host memory, native method, or process power.
 */
export function javaUnsafeReference(runtime) {
	let reference = SINGLETONS.get(runtime);
	if (!reference) {
		reference = runtime.heap.allocate(SUN_MISC_UNSAFE);
		SINGLETONS.set(runtime, reference);
	}
	return reference;
}

export function initializeJavaUnsafeStaticField(runtime, metadata) {
	if (metadata.frameworkInitializer !== INITIALIZER) {
		return Object.freeze({ supported: false, value: 0 });
	}
	return Object.freeze({
		supported: true,
		value: javaUnsafeReference(runtime)
	});
}
