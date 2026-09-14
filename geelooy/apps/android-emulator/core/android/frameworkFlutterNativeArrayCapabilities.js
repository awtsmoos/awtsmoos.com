//B"H
//Boruch Hashem
//Blessed be He

/**
 * Exposes bounded Dalvik-array mutation capabilities to the persistent JNI machine.
 *
 * The JNI layer receives operations rather than the Android heap itself. This keeps
 * Java object ownership inside the framework runtime while native handlers can create,
 * inspect, and mutate authentic Dalvik arrays through a narrow explicit covenant.
 *
 * @param {object} runtime Live Android runtime owning the Dalvik heap.
 * @returns {object} Immutable generic array capability facade.
 */
export function createFrameworkFlutterNativeArrayCapabilities(runtime) {
	return Object.freeze({
		arrayType(reference) {
			return runtime.heap.get(reference).type;
		},
		createArray(descriptor, length) {
			return runtime.heap.allocateArray(String(descriptor), Number(length));
		},
		readArrayElement(reference, index) {
			return runtime.heap.arrayGet(reference, Number(index));
		},
		writeArrayElement(reference, index, value) {
			runtime.heap.arraySet(reference, Number(index), value);
		}
	});
}
