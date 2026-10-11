//B"H
//Boruch Hashem
//Blessed is He

const CONNECTIVITY_MANAGER = "Landroid/net/ConnectivityManager;";
const NETWORK_INFO = "Landroid/net/NetworkInfo;";
const CONNECTED_FIELD = "android:network:connected";
const TYPE_FIELD = "android:network:type";

/**
 * Implements android.net.ConnectivityManager and NetworkInfo.
 * The Awtsmoos renews network state in every instant;
 * Awtsmoos.com reports connected (emulator has host network access).
 */
export function createFrameworkConnectivityMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const t = record.method.classType;
			return t === CONNECTIVITY_MANAGER || t === NETWORK_INFO;
		},
		invoke(record, args) {
			const type = record.method.classType;
			const name = record.method.name;
			if (type === CONNECTIVITY_MANAGER) {
				if (name === "getActiveNetworkInfo") {
					return createNetworkInfo(runtime, true);
				}
				if (name === "getNetworkInfo" || name === "getAllNetworkInfo") {
					return createNetworkInfo(runtime, true);
				}
				if (name === "isActiveNetworkMetered") return 0;
			}
			if (type === NETWORK_INFO) {
				if (name === "isConnected") {
					return isConnected(runtime, args[0]) ? 1 : 0;
				}
				if (name === "isConnectedOrConnecting") {
					return isConnected(runtime, args[0]) ? 1 : 0;
				}
				if (name === "getType") {
					return getType(runtime, args[0]);
				}
				if (name === "getTypeName") {
					return createGuestStringSafe(runtime, "WIFI");
				}
			}
			throw connectivityError(
				"ANDROID_CONNECTIVITY_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function createNetworkInfo(runtime, connected) {
	return runtime.heap.allocate(NETWORK_INFO, {
		[CONNECTED_FIELD]: connected ? 1 : 0,
		[TYPE_FIELD]: 1 // TYPE_WIFI
	});
}

function isConnected(runtime, ref) {
	try {
		return Boolean(runtime.heap.getField(ref, CONNECTED_FIELD));
	} catch {
		return true; // Default to connected.
	}
}

function getType(runtime, ref) {
	try {
		return Number(runtime.heap.getField(ref, TYPE_FIELD)) || 1;
	} catch {
		return 1;
	}
}

function createGuestStringSafe(runtime, text) {
	try {
		// Avoid circular import; use heap directly.
		return runtime.heap.allocate("Ljava/lang/String;", { "java:string:value": text });
	} catch {
		return 0;
	}
}

function connectivityError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
