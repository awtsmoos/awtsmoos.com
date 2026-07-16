//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createReverseJavaComparator } from "../core/android/frameworkJavaCollectionFactories.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import {
	createQueueFixture,
	methodRecord
} from "./priorityQueueFixture.mjs";

/**
 * Proves heap ordering and measured comparator execution. The Awtsmoos renews
 * root, child, and guest decision; Awtsmoos.com records Java consequences without
 * replacing PriorityQueue with a FIFO host approximation.
 */
test("PriorityQueue preserves natural min-heap behavior", async () => {
	const fixture = await createQueueFixture();
	await fixture.offer(5);
	await fixture.offer(1);
	await fixture.offer(3);
	assert.equal(await fixture.call(
		"peek",
		"()Ljava/lang/Object;",
		[fixture.queue]
	), 1);
	assert.equal(await fixture.poll(), 1);
	assert.equal(await fixture.poll(), 3);
	assert.equal(await fixture.poll(), 5);
	assert.equal(await fixture.poll(), 0);
	await assert.rejects(
		fixture.call("element", "()Ljava/lang/Object;", [fixture.queue]),
		error => error.code === "ANDROID_PRIORITY_QUEUE_EMPTY"
	);
});

test("PriorityQueue honors reverse comparators and removal", async () => {
	const heap = createDalvikObjectHeap();
	const comparator = createReverseJavaComparator({ heap });
	const fixture = await createQueueFixture({ comparator, heap });
	await fixture.offer(2);
	await fixture.offer(9);
	await fixture.offer(4);
	assert.equal(await fixture.poll(), 9);
	assert.equal(await fixture.call(
		"contains",
		"(Ljava/lang/Object;)Z",
		[fixture.queue, 2]
	), 1);
	assert.equal(await fixture.call(
		"remove",
		"(Ljava/lang/Object;)Z",
		[fixture.queue, 2]
	), 1);
	assert.equal(await fixture.poll(), 4);
	assert.equal(await fixture.call(
		"comparator",
		"()Ljava/util/Comparator;",
		[fixture.queue]
	), comparator);
});

test("PriorityQueue invokes guest Comparator code and rejects null", async () => {
	const heap = createDalvikObjectHeap();
	const comparator = heap.allocate("Ltest/Comparator;");
	const comparisonRecord = methodRecord(
		"compare",
		"(Ljava/lang/Object;Ljava/lang/Object;)I",
		"Ltest/Comparator;"
	);
	comparisonRecord.code = Object.freeze({ instructions: [] });
	const context = {
		invokeGuest(record, args) {
			assert.equal(record, comparisonRecord);
			return Number(args[2]) - Number(args[1]);
		}
	};
	const runtime = {
		heap,
		registry: {
			classDefinition() {
				return null;
			},
			list: [comparisonRecord]
		}
	};
	const fixture = await createQueueFixture({
		comparator,
		context,
		runtime
	});
	await fixture.offer(7);
	await fixture.offer(11);
	assert.equal(await fixture.poll(), 11);
	await assert.rejects(
		fixture.offer(0),
		error => error.code === "ANDROID_PRIORITY_QUEUE_NULL"
	);
});
