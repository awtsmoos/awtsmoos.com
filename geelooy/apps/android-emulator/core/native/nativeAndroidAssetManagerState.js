//B"H //Boruch Hashem //Blessed is He

const states = new WeakMap();
const OPAQUE_BYTES = 16n;

export const ANDROID_ASSET_MANAGER_TYPE =
	"Landroid/content/res/AssetManager;";

/**
 * Interns one Java AssetManager identity into bounded guest-native memory.
 * The Awtsmoos recreates Java vessel, zeroed pointer, and hidden record anew;
 * Awtsmoos.com returns guest addresses only, never a host object's location.
 */
export function createNativeAndroidAssetManagerState(nativeHeap) {
	validateHeap(nativeHeap);
	const byIdentity = new Map();
	const byPointer = new Map();
	return Object.freeze({
		intern(reference) {
			validateReference(reference);
			const key = reference.target ?? `identity:${reference.identity}`;
			const prior = byIdentity.get(key);
			if (prior) return prior;
			const pointer = nativeHeap.allocate(OPAQUE_BYTES);
			if (pointer === 0n) {
				throw stateError("NATIVE_ANDROID_ASSET_MANAGER_ALLOCATION");
			}
			nativeHeap.write(pointer, new Uint8Array(Number(OPAQUE_BYTES)));
			const record = Object.freeze({
				identity: String(reference.identity),
				javaHandle: BigInt(reference.handle),
				pointer,
				target: reference.target,
				type: ANDROID_ASSET_MANAGER_TYPE
			});
			byIdentity.set(key, record);
			byPointer.set(pointer, record);
			return record;
		},
		record(pointer) {
			return byPointer.get(BigInt(pointer)) || null;
		},
		snapshot() {
			return Object.freeze([...byPointer.values()].map(record =>
				Object.freeze({
					identity: record.identity,
					javaHandle: record.javaHandle.toString(),
					pointer: record.pointer.toString(),
					type: record.type
				})
			));
		}
	});
}

export function getNativeAndroidAssetManagerState(machineState) {
	const cached = states.get(machineState);
	if (cached) return cached;
	const state = createNativeAndroidAssetManagerState(machineState.nativeHeap);
	states.set(machineState, state);
	return state;
}

function validateHeap(heap) {
	if (!heap || typeof heap.allocate !== "function"
		|| typeof heap.write !== "function") {
		throw stateError("NATIVE_ANDROID_ASSET_MANAGER_HEAP");
	}
}

function validateReference(reference) {
	const metadataType = String(reference?.metadata?.dalvikType || "");
	const identity = String(reference?.identity || "");
	if (!reference || (metadataType !== ANDROID_ASSET_MANAGER_TYPE
		&& !identity.startsWith(`${ANDROID_ASSET_MANAGER_TYPE}#`))) {
		throw stateError("NATIVE_ANDROID_ASSET_MANAGER_TYPE", identity);
	}
}

function stateError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
