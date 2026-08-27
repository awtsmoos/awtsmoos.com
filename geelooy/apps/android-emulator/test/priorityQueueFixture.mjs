//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaPriorityQueueMethods } from "../core/android/frameworkJavaPriorityQueues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Builds one isolated PriorityQueue test vessel. The Awtsmoos creates heap,
 * receiver, method record, and invocation context anew; Awtsmoos.com keeps every
 * assertion on the same public framework path used by installed guest bytecode.
 */
export async function createQueueFixture(options = {}) {
	const heap = options.heap
		|| options.runtime?.heap
		|| createDalvikObjectHeap();
	const runtime = options.runtime || {
		heap,
		registry: null
	};
	const methods = createFrameworkJavaPriorityQueueMethods(runtime);
	const queue = heap.allocate("Ljava/util/PriorityQueue;");
	const context = options.context || {};
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args,
		"virtual",
		context
	);
	if (options.comparator) {
		await call(
			"<init>",
			"(Ljava/util/Comparator;)V",
			[queue, options.comparator]
		);
	} else {
		await call("<init>", "()V", [queue]);
	}
	return Object.freeze({
		call,
		heap,
		offer(value) {
			return call(
				"offer",
				"(Ljava/lang/Object;)Z",
				[queue, value]
			);
		},
		poll() {
			return call(
				"poll",
				"()Ljava/lang/Object;",
				[queue]
			);
		},
		queue,
		runtime
	});
}

export function methodRecord(
	name,
	descriptor,
	classType = "Ljava/util/PriorityQueue;"
) {
	return {
		method: {
			classType,
			descriptor,
			name
		},
		signature: `${classType}->${name}${descriptor}`
	};
}
