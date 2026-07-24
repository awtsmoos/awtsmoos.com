//B"H
//Boruch Hashem
//Blessed is He

import {
	WRAPPER_IMMUTABLE_FIELD,
	WRAPPER_TARGET_FIELD
} from "./frameworkJavaCollectionFactories.js";

const WRAPPER_TYPES = new Set([
	"Ljava/util/Collections$SynchronizedCollection;",
	"Ljava/util/Collections$SynchronizedList;",
	"Ljava/util/Collections$SynchronizedMap;",
	"Ljava/util/Collections$SynchronizedSet;",
	"Ljava/util/Collections$SynchronizedSortedMap;",
	"Ljava/util/Collections$UnmodifiableCollection;",
	"Ljava/util/Collections$UnmodifiableList;",
	"Ljava/util/Collections$UnmodifiableMap;",
	"Ljava/util/Collections$UnmodifiableSet;",
	"Ljava/util/Collections$UnmodifiableSortedMap;"
]);
const MUTATIONS = new Set([
	"add",
	"addAll",
	"clear",
	"put",
	"putAll",
	"remove",
	"removeAll",
	"set"
]);

/**
 * Forwards synchronized and unmodifiable collection wrappers to live sources. The
 * Awtsmoos creates wrapper identity, source view, and mutation covenant anew;
 * Awtsmoos.com keeps reads live and blocks writes only through immutable wrappers.
 */
export function createFrameworkJavaCollectionWrapperMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return WRAPPER_TYPES.has(record.method.classType);
		},
		async invoke(record, args, dispatch, context) {
			const wrapper = args[0];
			if (isImmutable(runtime, wrapper)
				&& MUTATIONS.has(record.method.name)) {
				throw wrapperError("ANDROID_JAVA_COLLECTION_UNMODIFIABLE");
			}
			const target = runtime.heap.getField(wrapper, WRAPPER_TARGET_FIELD);
			if (!target?.id) {
				throw wrapperError("ANDROID_JAVA_COLLECTION_WRAPPER_TARGET");
			}
			const targetType = runtime.heap.get(target).type;
			const forwarded = Object.freeze({
				...record,
				method: Object.freeze({
					...record.method,
					classType: targetType
				}),
				signature: `${targetType}->${record.method.name}${record.method.descriptor}`
			});
			return context.framework.invoke(
				forwarded,
				[target, ...args.slice(1)],
				dispatch,
				context
			);
		}
	});
}

function isImmutable(runtime, reference) {
	return runtime.heap.getField(reference, WRAPPER_IMMUTABLE_FIELD) === true;
}

function wrapperError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
