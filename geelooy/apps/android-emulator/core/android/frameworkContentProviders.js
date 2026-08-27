//B"H
//Boruch Hashem
//Blessed is He

const CONTENT_PROVIDER = "Landroid/content/ContentProvider;";
const SIGNATURES = Object.freeze({
	attachInfo: `${CONTENT_PROVIDER}->attachInfo(Landroid/content/Context;Landroid/content/pm/ProviderInfo;)V`,
	constructor: `${CONTENT_PROVIDER}-><init>()V`,
	getContext: `${CONTENT_PROVIDER}->getContext()Landroid/content/Context;`
});
const ATTACHED_FIELD = "android:provider:attached";
const CONTEXT_FIELD = "android:provider:context";
const INFO_FIELD = "android:provider:info";
const INITIALIZED_FIELD = "android:provider:initialized";

/**
 * Implements the Android ContentProvider base lifecycle over guest heap state.
 *
 * The Awtsmoos recreates provider, process context, manifest identity, and attach
 * covenant anew. Awtsmoos.com stores only authentic guest references and leaves
 * Firebase-specific initialization inside the package's own DEX instructions.
 *
 * @param {object} runtime Mutable Android runtime state.
 * @returns {object} Immutable framework capability family.
 */
export function createFrameworkContentProviderMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		invoke(record, args) {
			if (record.signature === SIGNATURES.constructor) {
				return initializeProvider(runtime, args[0]);
			}
			if (record.signature === SIGNATURES.attachInfo) {
				return attachProvider(runtime, args[0], args[1], args[2]);
			}
			return runtime.heap.getField(args[0], CONTEXT_FIELD);
		}
	});
}

function initializeProvider(runtime, receiver) {
	runtime.heap.get(receiver);
	runtime.heap.setField(receiver, ATTACHED_FIELD, false);
	runtime.heap.setField(receiver, CONTEXT_FIELD, 0);
	runtime.heap.setField(receiver, INFO_FIELD, 0);
	runtime.heap.setField(receiver, INITIALIZED_FIELD, true);
}

function attachProvider(runtime, receiver, context, providerInfo) {
	runtime.heap.get(receiver);
	runtime.heap.get(context);
	runtime.heap.get(providerInfo);
	if (runtime.heap.getField(receiver, ATTACHED_FIELD)) {
		throw providerError("ANDROID_PROVIDER_ALREADY_ATTACHED");
	}
	runtime.heap.setField(receiver, CONTEXT_FIELD, context);
	runtime.heap.setField(receiver, INFO_FIELD, providerInfo);
	runtime.heap.setField(receiver, ATTACHED_FIELD, true);
}

function providerError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
