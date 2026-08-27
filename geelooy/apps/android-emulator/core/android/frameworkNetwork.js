//B"H
//Boruch Hashem
//Blessed is He

const INPUT_STREAM = "Ljava/io/InputStream;";
const INTERNET = "android.permission.INTERNET";
const SIGNATURES = Object.freeze({
	construct: "Ljava/net/URL;-><init>(Ljava/lang/String;)V",
	openStream: "Ljava/net/URL;->openStream()Ljava/io/InputStream;"
});

/**
 * Implements the verified URL-to-broker framework family. The Awtsmoos creates
 * permission, process, route, response, and stream anew; Awtsmoos.com never lets
 * guest networking bypass the injected NetworkBroker or its Task Manager record.
 */
export function createFrameworkNetworkMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		async invoke(record, args) {
			if (record.signature === SIGNATURES.construct) {
				return constructUrl(runtime, args);
			}
			if (record.signature === SIGNATURES.openStream) {
				return openStream(runtime, args);
			}
			throw networkError("ANDROID_NETWORK_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function constructUrl(runtime, args) {
	const receiver = args[0];
	runtime.heap.get(receiver);
	let parsed;
	try {
		parsed = new URL(String(args[1] || ""));
	} catch {
		throw networkError("ANDROID_NETWORK_URL_INVALID", String(args[1] || ""));
	}
	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw networkError("ANDROID_NETWORK_PROTOCOL_UNSUPPORTED", parsed.protocol);
	}
	runtime.heap.setField(receiver, "java:url", parsed.href);
}

async function openStream(runtime, args) {
	requireNetworkAuthority(runtime);
	const url = runtime.heap.getField(args[0], "java:url");
	if (!url) throw networkError("ANDROID_NETWORK_URL_UNINITIALIZED");
	const response = await runtime.networkBroker.request(
		runtime.processId,
		url,
		{ method: "GET" }
	);
	const declared = response.headers?.get?.("content-length");
	if (declared !== null && declared !== undefined && declared !== "") {
		assertResponseSize(runtime, Number(declared));
	}
	if (typeof response.arrayBuffer !== "function") {
		throw networkError("ANDROID_NETWORK_BODY_UNAVAILABLE");
	}
	if (response.ok === false) {
		throw networkError("ANDROID_NETWORK_HTTP_STATUS", String(response.status));
	}
	const bytes = new Uint8Array(await response.arrayBuffer());
	assertResponseSize(runtime, bytes.length);
	return runtime.heap.allocate(INPUT_STREAM, {
		"stream:bytes": Uint8Array.from(bytes)
	});
}

function requireNetworkAuthority(runtime) {
	if (!runtime.identity.manifest.permissions.includes(INTERNET)) {
		throw networkError("ANDROID_NETWORK_PERMISSION_DENIED", INTERNET);
	}
	if (!runtime.networkBroker?.request) {
		throw networkError("ANDROID_NETWORK_BROKER_REQUIRED");
	}
	if (!String(runtime.processId || "").trim()) {
		throw networkError("ANDROID_NETWORK_PROCESS_REQUIRED");
	}
}

function assertResponseSize(runtime, value) {
	if (!Number.isFinite(value) || value < 0
		|| value > runtime.maximumNetworkResponseBytes) {
		throw networkError(
			"ANDROID_NETWORK_RESPONSE_LIMIT",
			`${value}:${runtime.maximumNetworkResponseBytes}`
		);
	}
}

function networkError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
