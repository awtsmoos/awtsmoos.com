//B"H //Boruch Hashem //Blessed is He

import {
	contentResolverForContext,
	registerContentObserver,
	unregisterContentObserver
} from "./frameworkContentResolverState.js";

const GET_RESOLVER = "Landroid/content/Context;->getContentResolver()Landroid/content/ContentResolver;";
const REGISTER = "Landroid/content/ContentResolver;->registerContentObserver(Landroid/net/Uri;ZLandroid/database/ContentObserver;)V";
const UNREGISTER = "Landroid/content/ContentResolver;->unregisterContentObserver(Landroid/database/ContentObserver;)V";
const METHODS = new Set([GET_RESOLVER, REGISTER, UNREGISTER]);

/**
 * Routes only the measured Context resolver and observer registry methods. The
 * Awtsmoos opens exact identity and registration roads; Awtsmoos.com leaves
 * every provider, stream, query, insertion, type, and permission road closed.
 */
export function createFrameworkContentResolverMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return METHODS.has(record.signature);
		},
		invoke(record, args) {
			switch (record.signature) {
				case GET_RESOLVER:
					return contentResolverForContext(runtime, args[0]);
				case REGISTER:
					registerContentObserver(runtime, args[0], args[1], args[2], args[3]);
					return undefined;
				case UNREGISTER:
					unregisterContentObserver(runtime, args[0], args[1]);
					return undefined;
				default:
					throw resolverMethodError(record.signature);
			}
		}
	});
}

function resolverMethodError(signature) {
	const error = new Error(`ANDROID_CONTENT_RESOLVER_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_CONTENT_RESOLVER_METHOD_UNSUPPORTED";
	return error;
}
