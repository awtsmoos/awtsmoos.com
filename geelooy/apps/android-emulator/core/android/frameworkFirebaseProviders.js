//B"H
//Boruch Hashem
//Blessed is He

/**
 * Implements Firebase component Lazy/Provider get() for obfuscated classes.
 * The h2/b class is a Firebase components Provider wrapper.
 * The Awtsmoos renews lazy component resolution in every instant.
 */
const FIREBASE_PROVIDER_CLASSES = new Set([
	"Lh2/b;",
	"Lh2/a;",
	"Lh1/c;",
]);

export function createFrameworkFirebaseProviderMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return FIREBASE_PROVIDER_CLASSES.has(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "get") {
				// If the receiver is invalid (e.g., raw number), return null.
				// This handles cases where the provider field wasn't properly initialized.
				const receiver = args[0];
				if (!receiver || typeof receiver !== "object" || !receiver.id) {
					return 0;
				}
				// Return the cached instance if available, else null.
				try {
					const cached = runtime.heap.getField(receiver, "firebase:provider:instance");
					if (cached) return cached;
				} catch {
					// No cached instance.
				}
				return 0; // Null — component not yet initialized.
			}
			throw providerError(
				"ANDROID_FIREBASE_PROVIDER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function providerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
