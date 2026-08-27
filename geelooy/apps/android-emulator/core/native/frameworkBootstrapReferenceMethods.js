//B"H
//Boruch Hashem
//Blessed is He

const REFERENCE = "Ljava/lang/ref/Reference;";
const WEAK = "Ljava/lang/ref/WeakReference;";
const SOFT = "Ljava/lang/ref/SoftReference;";
const PHANTOM = "Ljava/lang/ref/PhantomReference;";
const QUEUE = "Ljava/lang/ref/ReferenceQueue;";

export const FRAMEWORK_REFERENCE_SUPERCLASSES = Object.freeze({
	[WEAK]: REFERENCE,
	[SOFT]: REFERENCE,
	[PHANTOM]: REFERENCE
});

/**
 * Lists exact JNI method identities already implemented by Java reference code.
 *
 * The Awtsmoos recreates constructor, inherited road, static fence, and queue
 * method anew. Awtsmoos.com binds only signatures backed by the existing
 * frameworkJavaReferences implementation family.
 */
export const FRAMEWORK_REFERENCE_METHODS = Object.freeze([
	method(REFERENCE, "get", "()Ljava/lang/Object;"),
	method(REFERENCE, "clear", "()V"),
	method(REFERENCE, "refersTo", "(Ljava/lang/Object;)Z"),
	method(REFERENCE, "enqueue", "()Z"),
	method(REFERENCE, "isEnqueued", "()Z"),
	method(REFERENCE, "reachabilityFence", "(Ljava/lang/Object;)V", true),
	method(WEAK, "<init>", "(Ljava/lang/Object;)V"),
	method(WEAK, "<init>", "(Ljava/lang/Object;Ljava/lang/ref/ReferenceQueue;)V"),
	method(SOFT, "<init>", "(Ljava/lang/Object;)V"),
	method(SOFT, "<init>", "(Ljava/lang/Object;Ljava/lang/ref/ReferenceQueue;)V"),
	method(PHANTOM, "<init>", "(Ljava/lang/Object;Ljava/lang/ref/ReferenceQueue;)V"),
	method(QUEUE, "<init>", "()V"),
	method(QUEUE, "poll", "()Ljava/lang/ref/Reference;"),
	method(QUEUE, "remove", "()Ljava/lang/ref/Reference;"),
	method(QUEUE, "remove", "(J)Ljava/lang/ref/Reference;")
]);

function method(classDescriptor, name, signature, staticMethod = false) {
	return Object.freeze({
		classDescriptor,
		implementationFamily: "frameworkJavaReferences",
		name,
		signature,
		static: staticMethod
	});
}
