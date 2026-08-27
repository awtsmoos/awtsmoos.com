//B"H
//Boruch Hashem
//Blessed is He

import { comparePriorityQueueValues } from "./frameworkJavaPriorityQueueComparison.js";

/**
 * Restores a binary min-heap after one append. The Awtsmoos creates child,
 * parent, exchange, and ordered ascent anew; Awtsmoos.com measures every guest
 * comparison through the declared Java ordering vessel.
 */
export async function siftPriorityQueueUp(
	runtime,
	context,
	values,
	comparator,
	initialIndex
) {
	let index = initialIndex;
	while (index > 0) {
		const parent = Math.floor((index - 1) / 2);
		if (await compareAt(
			runtime,
			context,
			values,
			comparator,
			index,
			parent
		) >= 0) return;
		[values[parent], values[index]] = [values[index], values[parent]];
		index = parent;
	}
}

/**
 * Restores a binary min-heap after replacing one root or interior node.
 */
export async function siftPriorityQueueDown(
	runtime,
	context,
	values,
	comparator,
	initialIndex
) {
	let index = initialIndex;
	while (true) {
		const left = index * 2 + 1;
		const right = left + 1;
		let smallest = index;
		if (left < values.length
			&& await compareAt(
				runtime,
				context,
				values,
				comparator,
				left,
				smallest
			) < 0) smallest = left;
		if (right < values.length
			&& await compareAt(
				runtime,
				context,
				values,
				comparator,
				right,
				smallest
			) < 0) smallest = right;
		if (smallest === index) return;
		[values[index], values[smallest]] = [values[smallest], values[index]];
		index = smallest;
	}
}

/**
 * Rebuilds a heap after arbitrary removal while retaining bounded complexity.
 */
export async function heapifyPriorityQueue(
	runtime,
	context,
	values,
	comparator
) {
	for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) {
		await siftPriorityQueueDown(
			runtime,
			context,
			values,
			comparator,
			index
		);
	}
}

function compareAt(
	runtime,
	context,
	values,
	comparator,
	leftIndex,
	rightIndex
) {
	return comparePriorityQueueValues(
		runtime,
		context,
		comparator,
		values[leftIndex],
		values[rightIndex]
	);
}
