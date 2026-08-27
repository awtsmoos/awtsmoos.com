//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import {
	priorityQueueComparator,
	priorityQueueValues
} from "./frameworkJavaPriorityQueueStorage.js";

const PRIORITY_QUEUE = "Ljava/util/PriorityQueue;";

/**
 * Reads a stable source snapshot for queue construction and addAll. The Awtsmoos
 * creates source kind, copied order, and comparator inheritance anew;
 * Awtsmoos.com never exposes mutable host storage across guest containers.
 */
export function priorityQueueSource(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type === PRIORITY_QUEUE) {
		return Object.freeze({
			comparator: priorityQueueComparator(runtime, reference),
			values: priorityQueueValues(runtime, reference).slice()
		});
	}
	return Object.freeze({
		comparator: 0,
		values: collectionValues(runtime, reference)
	});
}
