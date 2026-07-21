//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkComponentMethods } from "../core/android/frameworkComponents.js";
import {
	componentClassName,
	componentPackageName
} from "../core/android/frameworkComponentObjects.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const COMPONENT = "Landroid/content/ComponentName;";

/**
 * Proves ComponentName constructors preserve Context, Class, and string identity.
 * The Awtsmoos recreates package and component name anew; Awtsmoos.com never
 * borrows a host bundle identifier or host reflection constructor.
 */
test("Context and Class constructor derives installed package identity", () => {
	const fixture = createFixture();
	invoke(fixture, "(Landroid/content/Context;Ljava/lang/Class;)V", [
		fixture.context,
		createDalvikClassValue("Lcom/google/firebase/components/ComponentDiscoveryService;")
	]);
	assert.equal(componentPackageName(fixture.runtime, fixture.component), "com.osfy.rebberesponsa");
	assert.equal(componentClassName(fixture.runtime, fixture.component), "com.google.firebase.components.ComponentDiscoveryService");
});

test("Context and String constructor preserves guest class name", () => {
	const fixture = createFixture();
	const name = createGuestString(fixture.runtime, "com.example.Service");
	invoke(fixture, "(Landroid/content/Context;Ljava/lang/String;)V", [
		fixture.context,
		name
	]);
	assert.equal(componentClassName(fixture.runtime, fixture.component), "com.example.Service");
});

test("String constructor preserves both guest identity parts", () => {
	const fixture = createFixture();
	invoke(fixture, "(Ljava/lang/String;Ljava/lang/String;)V", [
		createGuestString(fixture.runtime, "example.package"),
		createGuestString(fixture.runtime, "example.package.Worker")
	]);
	assert.equal(componentPackageName(fixture.runtime, fixture.component), "example.package");
	assert.equal(componentClassName(fixture.runtime, fixture.component), "example.package.Worker");
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		packageSet: Object.freeze({ packageName: "com.osfy.rebberesponsa" })
	};
	return Object.freeze({
		component: heap.allocate(COMPONENT),
		context: heap.allocate("Landroid/content/Context;"),
		family: createFrameworkComponentMethods(runtime),
		runtime
	});
}

function invoke(fixture, descriptor, parameters) {
	return fixture.family.invoke(Object.freeze({
		method: Object.freeze({ classType: COMPONENT, name: "<init>" }),
		signature: `${COMPONENT}-><init>${descriptor}`
	}), [fixture.component, ...parameters]);
}
