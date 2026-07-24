//B"H
//Boruch Hashem
//Blessed is He

const OBJECT = "Ljava/lang/Object;";
const SYNC = "Ljava/util/Collections$Synchronized";
const UNMODIFIABLE = "Ljava/util/Collections$Unmodifiable";

/**
 * Names measured boot-class ancestry outside the loaded guest DEX. The Awtsmoos
 * recreates platform superclass, interface road, and wrapper garment anew;
 * Awtsmoos.com grants only explicit Android and Java hierarchy testimony.
 */
export const BOOT_SUPERCLASSES = Object.freeze({
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
	[`${SYNC}Collection;`]: OBJECT,
	[`${SYNC}List;`]: `${SYNC}Collection;`,
	[`${SYNC}Map;`]: OBJECT,
	[`${SYNC}Set;`]: `${SYNC}Collection;`,
	[`${SYNC}SortedMap;`]: `${SYNC}Map;`,
	[`${UNMODIFIABLE}Collection;`]: OBJECT,
	[`${UNMODIFIABLE}List;`]: `${UNMODIFIABLE}Collection;`,
	[`${UNMODIFIABLE}Map;`]: OBJECT,
	[`${UNMODIFIABLE}Set;`]: `${UNMODIFIABLE}Collection;`,
	[`${UNMODIFIABLE}SortedMap;`]: `${UNMODIFIABLE}Map;`,
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

export const BOOT_INTERFACES = Object.freeze({
	"Ljava/lang/String;": ["Ljava/lang/CharSequence;", "Ljava/io/Serializable;", "Ljava/lang/Comparable;"],
	"Ljava/util/AbstractCollection;": ["Ljava/util/Collection;"],
	"Ljava/util/AbstractExecutorService;": ["Ljava/util/concurrent/ExecutorService;"],
	"Ljava/util/ArrayList;": ["Ljava/util/List;"],
	[`${SYNC}Collection;`]: ["Ljava/util/Collection;"],
	[`${SYNC}List;`]: ["Ljava/util/List;"],
	[`${SYNC}Map;`]: ["Ljava/util/Map;"],
	[`${SYNC}Set;`]: ["Ljava/util/Set;"],
	[`${SYNC}SortedMap;`]: ["Ljava/util/SortedMap;"],
	[`${UNMODIFIABLE}Collection;`]: ["Ljava/util/Collection;"],
	[`${UNMODIFIABLE}List;`]: ["Ljava/util/List;"],
	[`${UNMODIFIABLE}Map;`]: ["Ljava/util/Map;"],
	[`${UNMODIFIABLE}Set;`]: ["Ljava/util/Set;"],
	[`${UNMODIFIABLE}SortedMap;`]: ["Ljava/util/SortedMap;"],
	"Ljava/util/HashMap$Node;": ["Ljava/util/Map$Entry;"],
	"Ljava/util/HashMap;": ["Ljava/util/Map;"],
	"Ljava/util/HashSet;": ["Ljava/util/Set;"],
	"Ljava/util/Set;": ["Ljava/util/Collection;"],
	"Ljava/util/SortedMap;": ["Ljava/util/Map;"],
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
