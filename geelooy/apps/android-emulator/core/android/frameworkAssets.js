//B"H
//Boruch Hashem
//Blessed is He

const ASSET_MANAGER = "Landroid/content/res/AssetManager;";
const INPUT_STREAM = "Ljava/io/InputStream;";
const STRING = "Ljava/lang/String;";
const SIGNATURES = Object.freeze({
	getAssets: "Landroid/app/Activity;->getAssets()Landroid/content/res/AssetManager;",
	open: "Landroid/content/res/AssetManager;->open(Ljava/lang/String;)Ljava/io/InputStream;",
	readAllBytes: "Ljava/io/InputStream;->readAllBytes()[B",
	stringUtf8: "Ljava/lang/String;-><init>([BLjava/lang/String;)V"
});

/**
 * Implements the verified AssetManager-to-String framework family. The Awtsmoos
 * creates manager, stream, array, and decoded speech anew; Awtsmoos.com reads only
 * through the validated package-content vessel and bounded guest heap.
 */
export function createFrameworkAssetMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		async invoke(record, args) {
			if (record.signature === SIGNATURES.getAssets) return assetManager(runtime, args);
			if (record.signature === SIGNATURES.open) return openAsset(runtime, args);
			if (record.signature === SIGNATURES.readAllBytes) return readAllBytes(runtime, args);
			if (record.signature === SIGNATURES.stringUtf8) return constructString(runtime, args);
			throw assetError("ANDROID_ASSET_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function assetManager(runtime, args) {
	runtime.heap.get(args[0]);
	if (!runtime.assetManager) {
		runtime.assetManager = runtime.heap.allocate(ASSET_MANAGER);
	}
	return runtime.assetManager;
}

async function openAsset(runtime, args) {
	runtime.heap.get(args[0]);
	const relativePath = String(args[1] || "");
	const bytes = await runtime.content.read(`assets/${relativePath}`);
	return runtime.heap.allocate(INPUT_STREAM, {
		"stream:bytes": bytes
	});
}

function readAllBytes(runtime, args) {
	const bytes = runtime.heap.getField(args[0], "stream:bytes");
	if (!(bytes instanceof Uint8Array)) {
		throw assetError("ANDROID_INPUT_STREAM_INVALID");
	}
	const array = runtime.heap.allocateArray("[B", bytes.length);
	for (let index = 0; index < bytes.length; index += 1) {
		runtime.heap.arraySet(array, index, bytes[index]);
	}
	return array;
}

function constructString(runtime, args) {
	const [receiver, byteArray, charsetValue] = args;
	if (String(charsetValue).toUpperCase() !== "UTF-8") {
		throw assetError("ANDROID_STRING_CHARSET_UNSUPPORTED", String(charsetValue));
	}
	const length = runtime.heap.arrayLength(byteArray);
	const bytes = new Uint8Array(length);
	for (let index = 0; index < length; index += 1) {
		bytes[index] = Number(runtime.heap.arrayGet(byteArray, index)) & 0xff;
	}
	let text;
	try {
		text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch (error) {
		const wrapped = assetError("ANDROID_STRING_UTF8_INVALID");
		wrapped.cause = error;
		throw wrapped;
	}
	runtime.heap.setField(receiver, "java:string", text);
	return undefined;
}

function assetError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
