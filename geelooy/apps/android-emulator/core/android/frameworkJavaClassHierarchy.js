//B"H
//Boruch Hashem
//Blessed is He

import {
	componentClassDescriptor,
	isPrimitiveClassDescriptor
} from "./frameworkJavaClassValues.js";

const OBJECT = "Ljava/lang/Object;";
const SPECIAL_SUPERCLASSES = Object.freeze({
	"Landroid/app/Activity;": "Landroid/view/ContextThemeWrapper;",
	"Landroid/app/Application;": "Landroid/content/ContextWrapper;",
	"Landroid/app/Service;": "Landroid/content/ContextWrapper;",
	"Landroid/content/ContextWrapper;": "Landroid/content/Context;",
	"Landroid/view/ContextThemeWrapper;": "Landroid/content/ContextWrapper;",
	"Ljava/lang/Class;": OBJECT,
	"Ljava/lang/ClassLoader;": OBJECT,
	"Ljava/lang/String;": OBJECT,
	"Ljava/util/AbstractCollection;": OBJECT,
	"Ljava/util/AbstractExecutorService;": OBJECT,
	"Ljava/util/ArrayList;": "Ljava/util/AbstractCollection;",
	"Ljava/util/HashMap;": OBJECT,
	"Ljava/util/HashSet;": OBJECT,
	"Ljava/util/LinkedHashMap;": "Ljava/util/HashMap;",
	"Ljava/util/LinkedHashSet;": "Ljava/util/HashSet;",
	"Ljava/util/WeakHashMap;": OBJECT,
	"Ljava/util/concurrent/CopyOnWriteArrayList;": OBJECT,
	"Ljava/util/concurrent/CopyOnWriteArraySet;": OBJECT,
	"Ljava/util/concurrent/FutureTask;": OBJECT,
	"Ljava/util/concurrent/ScheduledThreadPoolExecutor;": "Ljava/util/concurrent/ThreadPoolExecutor;",
	"Ljava/util/concurrent/ThreadPoolExecutor;": "Ljava/util/AbstractExecutorService;"
});
const SPECIAL_INTERFACES = Object.freeze({
	"Ljava/lang/String;": ["Ljava/lang/CharSequence;", "Ljava/io/Serializable;", "Ljava/lang/Comparable;"],
	"Ljava/util/AbstractCollection;": ["Ljava/util/Collection;"],
	"Ljava/util/AbstractExecutorService;": ["Ljava/util/concurrent/ExecutorService;"],
	"Ljava/util/ArrayList;": ["Ljava/util/List;"],
	"Ljava/util/HashMap$Node;": ["Ljava/util/Map$Entry;"],
	"Ljava/util/HashMap;": ["Ljava/util/Map;"],
	"Ljava/util/HashSet;": ["Ljava/util/Set;"],
	"Ljava/util/Set;": ["Ljava/util/Collection;"],
	"Ljava/util/WeakHashMap;": ["Ljava/util/Map;"],
	"Ljava/util/concurrent/CopyOnWriteArrayList;": ["Ljava/util/List;"],
	"Ljava/util/concurrent/CopyOnWriteArraySet;": ["Ljava/util/Set;"],
	"Ljava/util/concurrent/ExecutorService;": ["Ljava/util/concurrent/Executor;"],
	"Ljava/util/concurrent/FutureTask;": ["Ljava/util/concurrent/RunnableFuture;", "Ljava/util/concurrent/Future;", "Ljava/lang/Runnable;"],
	"Ljava/util/concurrent/RunnableFuture;": ["Ljava/lang/Runnable;", "Ljava/util/concurrent/Future;"],
	"Ljava/util/concurrent/ScheduledExecutorService;": ["Ljava/util/concurrent/ExecutorService;"],
	"Ljava/util/concurrent/ScheduledThreadPoolExecutor;": ["Ljava/util/concurrent/ScheduledExecutorService;"],
	"Ljava/util/concurrent/locks/ReentrantLock;": ["Ljava/util/concurrent/locks/Lock;"],
	"Ljava/util/concurrent/locks/ReentrantReadWriteLock;": ["Ljava/util/concurrent/locks/ReadWriteLock;"]
});

/**
 * Walks measured DEX hierarchy plus explicit boot-class testimony. The Awtsmoos
 * creates superclass, interface road, array covenant, and assignability anew;
 * Awtsmoos.com names platform edges without pretending interfaces are superclasses.
 */
export function isClassAssignable(runtime, targetDescriptor, sourceDescriptor) {
	const target = String(targetDescriptor);
	const source = String(sourceDescriptor);
	if (target === source) return true;
	if (isPrimitiveClassDescriptor(target) || isPrimitiveClassDescriptor(source)) return false;
	if (target === OBJECT) return true;
	if (source.startsWith("[")) return arrayAssignable(runtime, target, source);
	const pending = [source];
	const seen = new Set();
	while (pending.length) {
		const current = pending.shift();
		if (!current || seen.has(current)) continue;
		seen.add(current);
		if (current === target) return true;
		pending.push(...directParents(runtime, current));
	}
	return false;
}

export function directSuperclass(runtime, descriptor) {
	const value = String(descriptor);
	if (isPrimitiveClassDescriptor(value) || value === OBJECT) return null;
	if (value.startsWith("[")) return OBJECT;
	return runtime.registry?.superType(value)
		|| SPECIAL_SUPERCLASSES[value]
		|| null;
}

export function directInterfaces(runtime, descriptor) {
	const value = String(descriptor);
	if (value.startsWith("[")) {
		return ["Ljava/lang/Cloneable;", "Ljava/io/Serializable;"];
	}
	const measured = runtime.registry?.classDefinition(value)?.interfaces || [];
	return [...new Set([...measured, ...(SPECIAL_INTERFACES[value] || [])])];
}

export function isKnownClassDescriptor(runtime, descriptor) {
	const value = String(descriptor);
	if (isPrimitiveClassDescriptor(value)) return true;
	if (value.startsWith("[")) {
		return isKnownClassDescriptor(runtime, componentClassDescriptor(value));
	}
	return Boolean(runtime.registry?.classDefinition(value))
		|| /^(?:Ljava|Ljavax|Landroid|Lkotlin|Lj\$)\//.test(value);
}

function directParents(runtime, descriptor) {
	return [
		directSuperclass(runtime, descriptor),
		...directInterfaces(runtime, descriptor)
	].filter(Boolean);
}

function arrayAssignable(runtime, target, source) {
	if ([OBJECT, "Ljava/lang/Cloneable;", "Ljava/io/Serializable;"].includes(target)) return true;
	if (!target.startsWith("[")) return false;
	return isClassAssignable(runtime, target.slice(1), source.slice(1));
}
