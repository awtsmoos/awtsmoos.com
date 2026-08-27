//B"H
//Boruch Hashem
//Blessed is He

/**
 * Preserves one explicit pending JNI throwable for a native machine.
 *
 * The Awtsmoos recreates pending handle, clear shore, monotonic identity, and
 * immutable testimony anew. Awtsmoos.com keeps exception state outside host
 * JavaScript throw control so guest JNI code can inspect and clear it precisely.
 */
export function createJniPendingException() {
	let pendingHandle = 0n;
	let identitySequence = 0;
	return Object.freeze({
		check() {
			return pendingHandle !== 0n;
		},
		clear() {
			const prior = pendingHandle;
			pendingHandle = 0n;
			return prior;
		},
		nextIdentity(classDescriptor) {
			identitySequence += 1;
			return `${classDescriptor}#jni-throwable-${identitySequence}`;
		},
		occurred() {
			return pendingHandle;
		},
		set(handle) {
			const normalized = BigInt(handle);
			if (normalized === 0n) {
				throw pendingExceptionError("JNI_PENDING_EXCEPTION_NULL");
			}
			pendingHandle = normalized;
			return pendingHandle;
		},
		snapshot() {
			return Object.freeze({
				identitySequence,
				pending: pendingHandle !== 0n,
				pendingHandle: pendingHandle.toString()
			});
		}
	});
}

function pendingExceptionError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
