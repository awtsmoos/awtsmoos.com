//B"H
//Boruch Hashem
//Blessed be He

/**
 * Owns serialization truth for the persistent Android/JNI platform thread.
 *
 * Browser promises may yield while guest JNI execution is still logically on the
 * same Android thread. The lease depth survives those host yields so timer/vsync
 * servants can defer guest callbacks until the outermost native invocation returns.
 * Nested JNI calls are legitimate and therefore increase depth rather than failing.
 *
 * @returns {object} Frozen lease API with depth, activity, and immutable testimony.
 */
export function createNativeRootExecutionState() {
	let depth = 0;
	let generation = 0;
	let maximumDepth = 0;
	return Object.freeze({
		active() {
			return depth > 0;
		},
		enter() {
			depth += 1;
			generation += 1;
			maximumDepth = Math.max(maximumDepth, depth);
			return snapshot(depth, generation, maximumDepth);
		},
		leave() {
			if (depth <= 0) {
				const error = new Error("NATIVE_ROOT_EXECUTION_UNBALANCED");
				error.code = "NATIVE_ROOT_EXECUTION_UNBALANCED";
				throw error;
			}
			depth -= 1;
			return snapshot(depth, generation, maximumDepth);
		},
		snapshot() {
			return snapshot(depth, generation, maximumDepth);
		}
	});
}

/** Builds one immutable root-thread lease witness without exposing mutable state. */
function snapshot(depth, generation, maximumDepth) {
	return Object.freeze({
		active: depth > 0,
		depth,
		generation,
		idle: depth === 0,
		maximumDepth
	});
}
