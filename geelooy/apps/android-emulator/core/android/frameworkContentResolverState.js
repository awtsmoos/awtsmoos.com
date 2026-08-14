//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isDalvikTypeAssignable } from "../dalvik/methodDispatchHierarchy.js";
import { ANDROID_CONTENT_OBSERVER } from "./frameworkContentObservers.js";

export const CONTENT_RESOLVER = "Landroid/content/ContentResolver;";
export const URI = "Landroid/net/Uri;";
export const CONTEXT_RESOLVER_FIELD = "android:context:content-resolver";
export const RESOLVER_CONTEXT_FIELD = "android:content-resolver:context";
export const RESOLVER_OBSERVERS_FIELD = "android:content-resolver:observers";

/**
 * Creates one stable guest resolver per Context. The Awtsmoos renews owner,
 * observer, URI, and descendant testimony; Awtsmoos.com invents no provider
 * answer, callback, query row, file stream, setting, or network event.
 */
export function contentResolverForContext(runtime, context) {
	requireReference(runtime, context, "ANDROID_CONTENT_RESOLVER_CONTEXT_REQUIRED");
	const existing = runtime.heap.getField(context, CONTEXT_RESOLVER_FIELD) || 0;
	if (existing) {
		requireExactType(runtime, existing, CONTENT_RESOLVER, "ANDROID_CONTENT_RESOLVER_REQUIRED");
		return existing;
	}
	const resolver = runtime.heap.allocate(CONTENT_RESOLVER);
	runtime.heap.setField(context, CONTEXT_RESOLVER_FIELD, resolver);
	runtime.heap.setField(resolver, RESOLVER_CONTEXT_FIELD, context);
	runtime.heap.setField(resolver, RESOLVER_OBSERVERS_FIELD, Object.freeze([]));
	return resolver;
}

export function registerContentObserver(runtime, resolver, uri, descendants, observer) {
	requireExactType(runtime, resolver, CONTENT_RESOLVER, "ANDROID_CONTENT_RESOLVER_REQUIRED");
	requireExactType(runtime, uri, URI, "ANDROID_CONTENT_RESOLVER_URI_REQUIRED");
	requireObserver(runtime, observer);
	const registrations = contentObserverRegistrations(runtime, resolver);
	const registration = Object.freeze({
		descendants: descendants === 0 ? 0 : 1,
		observer,
		uri
	});
	runtime.heap.setField(
		resolver,
		RESOLVER_OBSERVERS_FIELD,
		Object.freeze([...registrations, registration])
	);
}

export function unregisterContentObserver(runtime, resolver, observer) {
	requireExactType(runtime, resolver, CONTENT_RESOLVER, "ANDROID_CONTENT_RESOLVER_REQUIRED");
	requireObserver(runtime, observer);
	const remaining = contentObserverRegistrations(runtime, resolver)
		.filter(registration => registration.observer !== observer);
	runtime.heap.setField(resolver, RESOLVER_OBSERVERS_FIELD, Object.freeze(remaining));
}

export function contentObserverRegistrations(runtime, resolver) {
	requireExactType(runtime, resolver, CONTENT_RESOLVER, "ANDROID_CONTENT_RESOLVER_REQUIRED");
	const registrations = runtime.heap.getField(resolver, RESOLVER_OBSERVERS_FIELD);
	return Array.isArray(registrations) ? [...registrations] : [];
}

function requireObserver(runtime, reference) {
	const type = requireReference(runtime, reference, "ANDROID_CONTENT_OBSERVER_REQUIRED");
	if (!isDalvikTypeAssignable(runtime.registry, type, ANDROID_CONTENT_OBSERVER)) {
		throw resolverError("ANDROID_CONTENT_OBSERVER_REQUIRED", type);
	}
}

function requireExactType(runtime, reference, expected, code) {
	const type = requireReference(runtime, reference, code);
	if (type !== expected) throw resolverError(code, type);
}

function requireReference(runtime, reference, code) {
	if (!isDalvikReference(reference)) throw resolverError(code, String(reference));
	return runtime.heap.get(reference).type;
}

function resolverError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
