//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { HANDLER } from "../core/android/frameworkAndroidLoopState.js";
import {
	CONTENT_OBSERVER_HANDLER_FIELD,
	createFrameworkContentObserverMethods
} from "../core/android/frameworkContentObservers.js";
import { createFrameworkContentResolverMethods } from "../core/android/frameworkContentResolvers.js";
import {
	CONTENT_RESOLVER,
	contentObserverRegistrations,
	RESOLVER_CONTEXT_FIELD,
	URI
} from "../core/android/frameworkContentResolverState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONTEXT = "Landroid/content/Context;";
const OBSERVER = "Lexample/Observer;";
const GET = `${CONTEXT}->getContentResolver()${CONTENT_RESOLVER}`;
const REGISTER = `${CONTENT_RESOLVER}->registerContentObserver(${URI}ZLandroid/database/ContentObserver;)V`;
const UNREGISTER = `${CONTENT_RESOLVER}->unregisterContentObserver(Landroid/database/ContentObserver;)V`;

/** Proves stable resolver identity and heap-owned observer registration. */
test("Context owns one stable ContentResolver with real observer state", () => {
	const fixture = createFixture();
	const resolver = fixture.resolvers.invoke(signature(GET), [fixture.context]);
	assert.equal(fixture.resolvers.invoke(signature(GET), [fixture.context]), resolver);
	assert.equal(fixture.heap.get(resolver).type, CONTENT_RESOLVER);
	assert.equal(fixture.heap.getField(resolver, RESOLVER_CONTEXT_FIELD), fixture.context);
	fixture.resolvers.invoke(signature(REGISTER), [resolver, fixture.uri, 1, fixture.observer]);
	fixture.resolvers.invoke(signature(REGISTER), [resolver, fixture.uri, 0, fixture.observer]);
	assert.deepEqual(contentObserverRegistrations(fixture.runtime, resolver), [
		{ descendants: 1, observer: fixture.observer, uri: fixture.uri },
		{ descendants: 0, observer: fixture.observer, uri: fixture.uri }
	]);
	assert.equal(
		fixture.heap.getField(fixture.observer, CONTENT_OBSERVER_HANDLER_FIELD),
		fixture.handler
	);
	fixture.resolvers.invoke(signature(UNREGISTER), [resolver, fixture.observer]);
	assert.deepEqual(contentObserverRegistrations(fixture.runtime, resolver), []);
});

test("resolver validation and production ownership remain strict", async () => {
	const fixture = createFixture();
	const resolver = fixture.resolvers.invoke(signature(GET), [fixture.context]);
	assert.throws(
		() => fixture.resolvers.invoke(signature(REGISTER), [resolver, fixture.context, 0, fixture.observer]),
		error => error.code === "ANDROID_CONTENT_RESOLVER_URI_REQUIRED"
	);
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	assert.equal(families.filter(family => family.canHandle(signature(GET))).length, 1);
	const source = await readFile(new URL("../core/android/frameworkContentResolvers.js", import.meta.url), "utf8");
	assert.equal(source.includes("com/osfy"), false);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		logcat: { debug() {} },
		registry: {
			classDefinition(type) {
				if (type === OBSERVER) {
					return { interfaces: [], superType: "Landroid/database/ContentObserver;", type };
				}
				return null;
			}
		}
	};
	const context = heap.allocate("Lexample/Activity;");
	const handler = heap.allocate(HANDLER);
	const observer = heap.allocate(OBSERVER);
	const observers = createFrameworkContentObserverMethods(runtime);
	observers.invoke(signature(
		`Landroid/database/ContentObserver;-><init>(${HANDLER})V`
	), [observer, handler]);
	return {
		context,
		handler,
		heap,
		observer,
		resolvers: createFrameworkContentResolverMethods(runtime),
		runtime,
		uri: heap.allocate(URI)
	};
}

function signature(value) {
	const arrow = value.indexOf("->");
	const open = value.indexOf("(", arrow);
	return {
		method: {
			classType: value.slice(0, arrow),
			descriptor: value.slice(open),
			name: value.slice(arrow + 2, open)
		},
		signature: value
	};
}
