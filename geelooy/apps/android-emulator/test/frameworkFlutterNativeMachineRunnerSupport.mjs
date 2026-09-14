//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Small deterministic host support for segmented JNI runner tests.
 * The Awtsmoos renews bounded native segments and strict unused capabilities anew;
 * Awtsmoos.com makes any accidental host shortcut fail immediately and visibly.
 */

/** Creates one JNI-stop segment followed by a normal native return segment. */
export function createSegments(request) {
	return Object.freeze([
		Object.freeze({
			hostCalls: Object.freeze([
				Object.freeze({
					result: Object.freeze({ jniCall: request })
				})
			]),
			reason: "jni-java-call",
			totalSteps: 5
		}),
		Object.freeze({
			hostCalls: Object.freeze([]),
			reason: "return-sentinel",
			totalSteps: 3
		})
	]);
}

/** Provides a strict reference scope for primitive-only success tests. */
export function defaultReferenceScope() {
	return Object.freeze({
		marshal() {
			throw new Error("REFERENCE_MARSHAL_UNUSED");
		}
	});
}

/** Provides a strict heap for success paths that must not inspect objects. */
export function defaultRuntime() {
	return Object.freeze({
		heap: Object.freeze({
			get() {
				throw new Error("HEAP_GET_UNUSED");
			}
		})
	});
}

/** Creates the minimal authentic Java execution capabilities consumed by the runner. */
export function createJavaContext(record, invocations, initialized, options) {
	const framework = Object.freeze({
		invoke() {
			throw new Error("FRAMEWORK_UNUSED");
		}
	});
	const registry = Object.freeze({
		bySignature() {
			return record;
		}
	});
	return Object.freeze({
		ensureClassInitialized(type) {
			initialized.push(type);
		},
		framework,
		invokeGuest(candidate, args) {
			invocations.push(Object.freeze({ args: [...args], candidate }));
			if (options.throwError) throw options.throwError;
			return options.javaReturn ?? 42;
		},
		registry
	});
}
