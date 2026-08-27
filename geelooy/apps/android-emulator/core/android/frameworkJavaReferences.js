//B"H
//Boruch Hashem
//Blessed is He

const REFERENT_FIELD = "java:reference:referent";
const QUEUE_FIELD = "java:reference:queue";
const ENQUEUED_FIELD = "java:reference:enqueued";
const QUEUE_VALUES_FIELD = "java:reference-queue:values";
const REFERENCE_TYPES = Object.freeze([
	"Ljava/lang/ref/Reference;",
	"Ljava/lang/ref/WeakReference;",
	"Ljava/lang/ref/SoftReference;",
	"Ljava/lang/ref/PhantomReference;"
]);
const REFERENCE_QUEUE = "Ljava/lang/ref/ReferenceQueue;";

/**
 * Models bounded guest references and queues. The Awtsmoos creates referent,
 * clearing, enqueueing, and queue order anew; Awtsmoos.com retains weak values
 * deterministically because the guest garbage collector has not yet been revealed.
 */
export function createFrameworkJavaReferenceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return REFERENCE_TYPES.includes(record.method.classType)
				|| record.method.classType === REFERENCE_QUEUE;
		},
		invoke(record, args) {
			if (record.method.classType === REFERENCE_QUEUE) {
				return invokeQueue(runtime, record.method.name, args);
			}
			return invokeReference(runtime, record, args);
		}
	});
}

function invokeReference(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return initializeReference(runtime, args);
	if (name === "get") return getReference(runtime, record.method.classType, args[0]);
	if (name === "clear") return setReferent(runtime, args[0], 0);
	if (name === "refersTo") return sameReferenceValue(runtime, args[0], args[1]) ? 1 : 0;
	if (name === "enqueue") return enqueueReference(runtime, args[0]);
	if (name === "isEnqueued") return runtime.heap.getField(args[0], ENQUEUED_FIELD) ? 1 : 0;
	if (name === "reachabilityFence") return undefined;
	throw referenceError("ANDROID_JAVA_REFERENCE_METHOD_UNSUPPORTED", record.signature);
}

function initializeReference(runtime, args) {
	runtime.heap.get(args[0]);
	setReferent(runtime, args[0], args[1] ?? 0);
	runtime.heap.setField(args[0], QUEUE_FIELD, args[2] ?? 0);
	runtime.heap.setField(args[0], ENQUEUED_FIELD, false);
}

function getReference(runtime, type, reference) {
	if (type === "Ljava/lang/ref/PhantomReference;") return 0;
	return runtime.heap.getField(reference, REFERENT_FIELD) ?? 0;
}

function setReferent(runtime, reference, value) {
	runtime.heap.setField(reference, REFERENT_FIELD, value ?? 0);
}

function sameReferenceValue(runtime, reference, expected) {
	const current = runtime.heap.getField(reference, REFERENT_FIELD) ?? 0;
	if (current === expected) return true;
	return Boolean(current?.kind === "dalvik-reference"
		&& expected?.kind === "dalvik-reference"
		&& current.id === expected.id);
}

function enqueueReference(runtime, reference) {
	if (runtime.heap.getField(reference, ENQUEUED_FIELD)) return 0;
	const queue = runtime.heap.getField(reference, QUEUE_FIELD);
	if (!queue?.id) return 0;
	queueValues(runtime, queue).push(reference);
	runtime.heap.setField(reference, ENQUEUED_FIELD, true);
	return 1;
}

function invokeQueue(runtime, name, args) {
	if (name === "<init>") {
		runtime.heap.get(args[0]);
		runtime.heap.setField(args[0], QUEUE_VALUES_FIELD, []);
		return undefined;
	}
	if (name === "poll") return dequeue(runtime, args[0]);
	if (name === "remove") return dequeue(runtime, args[0]);
	throw referenceError("ANDROID_JAVA_REFERENCE_QUEUE_METHOD_UNSUPPORTED", name);
}

function dequeue(runtime, queue) {
	const reference = queueValues(runtime, queue).shift() ?? 0;
	if (reference?.id) runtime.heap.setField(reference, ENQUEUED_FIELD, false);
	return reference;
}

function queueValues(runtime, queue) {
	const values = runtime.heap.getField(queue, QUEUE_VALUES_FIELD);
	if (!Array.isArray(values)) {
		throw referenceError("ANDROID_JAVA_REFERENCE_QUEUE_UNINITIALIZED");
	}
	return values;
}

function referenceError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
