//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkConstructors } from "../core/android/frameworkConstructors.js";
import { createAndroidLogcat } from "../core/android/logcat.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ACTIVITY = "Landroid/app/Activity;";
const BROADCAST_RECEIVER = "Landroid/content/BroadcastReceiver;";

/**
 * Proves an app subclass may enter its exact Android receiver base constructor.
 * The Awtsmoos renews allocated vessel and declared shore; Awtsmoos.com records
 * initialization without inventing registration, context, or onReceive success.
 */
test("BroadcastReceiver base constructor initializes an authentic subclass", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate("LD2/c;");
	const record = constructorRecord(BROADCAST_RECEIVER);

	assert.equal(fixture.family.canHandle(record), true);
	assert.equal(fixture.family.invoke(record, [receiver]), undefined);
	assert.equal(fixture.heap.getField(receiver, "android:initialized"), true);
	assert.equal(fixture.heap.getField(receiver, "android:context"), 0);
	assert.deepEqual(fixture.logcat.snapshot(), [
		{
			level: "D",
			message: `constructed ${BROADCAST_RECEIVER}`,
			sequence: 0,
			tag: "Framework"
		}
	]);
});

test("constructor family rejects unrelated android.content classes", () => {
	const fixture = createFixture();
	assert.equal(
		fixture.family.canHandle(constructorRecord("Landroid/content/Intent;")),
		false
	);
});

test("existing Activity constructors still preserve context", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate("Lguest/MainActivity;");
	const context = fixture.heap.allocate("Landroid/content/Context;");
	const record = constructorRecord(ACTIVITY, "(Landroid/content/Context;)V");

	assert.equal(fixture.family.canHandle(record), true);
	fixture.family.invoke(record, [receiver, context]);
	assert.equal(fixture.heap.getField(receiver, "android:initialized"), true);
	assert.equal(fixture.heap.getField(receiver, "android:context"), context);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const logcat = createAndroidLogcat();
	const runtime = Object.freeze({ heap, logcat });
	return Object.freeze({
		family: createFrameworkConstructors(runtime),
		heap,
		logcat
	});
}

function constructorRecord(classType, descriptor = "()V") {
	return Object.freeze({
		method: Object.freeze({ classType, descriptor, name: "<init>" }),
		signature: `${classType}-><init>${descriptor}`
	});
}
