//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaIteratorMethods } from "../core/android/frameworkJavaIterators.js";
import { createFrameworkJavaListMethods } from "../core/android/frameworkJavaLists.js";
import { javaListValues } from "../core/android/frameworkJavaListStorage.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves List.iterator traversal and source mutation through shared collection
 * storage. The Awtsmoos creates list, snapshot cursor, last value, and bounded
 * removal anew; Awtsmoos.com keeps ArrayList bytecode on generic Iterator roads.
 */
test("ArrayList iterator preserves order and exhaustion", () => {
	const fixture = createListIteratorFixture();
	const first = fixture.object();
	const second = fixture.object();
	fixture.add(first);
	fixture.add(second);
	const iterator = fixture.iterator();
	assert.equal(fixture.iteratorCall("hasNext", "()Z", iterator), 1);
	assert.equal(fixture.iteratorCall("next", "()Ljava/lang/Object;", iterator), first);
	assert.equal(fixture.iteratorCall("next", "()Ljava/lang/Object;", iterator), second);
	assert.equal(fixture.iteratorCall("hasNext", "()Z", iterator), 0);
	assert.throws(
		() => fixture.iteratorCall("next", "()Ljava/lang/Object;", iterator),
		error => error.code === "ANDROID_JAVA_ITERATOR_EXHAUSTED"
	);
});

test("ArrayList iterator remove mutates the source once", () => {
	const fixture = createListIteratorFixture();
	const first = fixture.object();
	const second = fixture.object();
	fixture.add(first);
	fixture.add(second);
	const iterator = fixture.iterator();
	fixture.iteratorCall("next", "()Ljava/lang/Object;", iterator);
	fixture.iteratorCall("remove", "()V", iterator);
	assert.deepEqual(javaListValues(fixture.runtime, fixture.list), [second]);
	assert.throws(
		() => fixture.iteratorCall("remove", "()V", iterator),
		error => error.code === "ANDROID_JAVA_ITERATOR_REMOVE_STATE"
	);
});

function createListIteratorFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const lists = createFrameworkJavaListMethods(runtime);
	const iterators = createFrameworkJavaIteratorMethods(runtime);
	const list = heap.allocate("Ljava/util/ArrayList;");
	lists.invoke(listRecord("<init>", "()V"), [list]);
	return Object.freeze({
		add(value) {
			return lists.invoke(
				listRecord("add", "(Ljava/lang/Object;)Z"),
				[list, value]
			);
		},
		iterator() {
			return lists.invoke(
				listRecord("iterator", "()Ljava/util/Iterator;"),
				[list]
			);
		},
		iteratorCall(name, descriptor, iterator) {
			return iterators.invoke(iteratorRecord(name, descriptor), [iterator]);
		},
		list,
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		runtime
	});
}

function listRecord(name, descriptor) {
	return methodRecord("Ljava/util/ArrayList;", name, descriptor);
}

function iteratorRecord(name, descriptor) {
	return methodRecord("Ljava/util/Iterator;", name, descriptor);
}

function methodRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
