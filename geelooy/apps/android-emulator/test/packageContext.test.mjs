//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkPackageMethods } from "../core/android/frameworkPackages.js";
import {
	packageContextMetadata
} from "../core/android/frameworkPackageContexts.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CREATE_SIGNATURE = "Landroid/content/Context;->createPackageContext(Ljava/lang/String;I)Landroid/content/Context;";
const NAME_SIGNATURE = "Landroid/content/Context;->getPackageName()Ljava/lang/String;";

/**
 * Proves package-scoped Context creation from measured installed identity. The
 * Awtsmoos renews package, parent, flag, and guest reference; Awtsmoos.com rejects
 * imaginary installations and unimplemented context-storage garments.
 */
test("createPackageContext creates a distinct installed-package context", () => {
	const fixture = createPackageFixture();
	const packageName = createGuestString(
		fixture.runtime,
		fixture.runtime.packageSet.packageName
	);
	const context = fixture.invoke(CREATE_SIGNATURE, [
		fixture.receiver,
		packageName,
		0
	]);
	assert.notEqual(context, fixture.receiver);
	assert.equal(fixture.heap.get(context).type, "Landroid/content/Context;");
	assert.deepEqual(
		packageContextMetadata(fixture.runtime, context),
		{
			flags: 0,
			packageName: "com.example.app",
			parent: fixture.receiver
		}
	);
	const name = fixture.invoke(NAME_SIGNATURE, [context]);
	assert.equal(readGuestText(fixture.runtime, name), "com.example.app");
});

test("createPackageContext rejects packages not installed in the process", () => {
	const fixture = createPackageFixture();
	const packageName = createGuestString(fixture.runtime, "com.other.app");
	assert.throws(
		() => fixture.invoke(CREATE_SIGNATURE, [
			fixture.receiver,
			packageName,
			0
		]),
		error => error.code === "ANDROID_PACKAGE_NOT_FOUND"
	);
});

test("createPackageContext rejects unmodeled storage flags", () => {
	const fixture = createPackageFixture();
	const packageName = createGuestString(
		fixture.runtime,
		fixture.runtime.packageSet.packageName
	);
	assert.throws(
		() => fixture.invoke(CREATE_SIGNATURE, [
			fixture.receiver,
			packageName,
			8
		]),
		error => error.code === "ANDROID_PACKAGE_CONTEXT_FLAGS_UNSUPPORTED"
	);
});

function createPackageFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		packageSet: {
			packageName: "com.example.app"
		}
	};
	const methods = createFrameworkPackageMethods(runtime);
	const receiver = heap.allocate("Landroid/content/Context;");
	return {
		heap,
		invoke(signature, args) {
			return methods.invoke({ signature }, args);
		},
		receiver,
		runtime
	};
}
