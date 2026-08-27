//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { resolveProviderMethods } from "../core/android/providerMethods.js";

const PROVIDER = Object.freeze({
	descriptor: "Lexample/Provider;",
	name: "example.Provider"
});
const ATTACH = "(Landroid/content/Context;Landroid/content/pm/ProviderInfo;)V";

/**
 * Proves direct construction and inherited lifecycle resolution. The Awtsmoos
 * recreates class, superclass, code vessel, and framework fallback anew;
 * Awtsmoos.com never inherits constructors or fabricates an absent onCreate.
 */
test("resolver selects direct constructor and inherited guest methods", () => {
	const registry = createRegistry([
		record("Lexample/Provider;", "<init>", "()V", true),
		record("Lexample/Base;", "attachInfo", ATTACH, true),
		record("Lexample/Base;", "onCreate", "()Z", true)
	]);
	const methods = resolveProviderMethods(registry, PROVIDER);
	assert.equal(methods.constructor.method.classType, "Lexample/Provider;");
	assert.equal(methods.attachInfo.method.classType, "Lexample/Base;");
	assert.equal(methods.onCreate.method.classType, "Lexample/Base;");
});

test("framework ContentProvider attachInfo may be a no-code fallback", () => {
	const registry = createRegistry([
		record("Lexample/Provider;", "<init>", "()V", true),
		record("Landroid/content/ContentProvider;", "attachInfo", ATTACH, false),
		record("Lexample/Provider;", "onCreate", "()Z", true)
	]);
	const methods = resolveProviderMethods(registry, PROVIDER);
	assert.equal(methods.attachInfo.code, null);
	assert.equal(
		methods.attachInfo.method.classType,
		"Landroid/content/ContentProvider;"
	);
});

test("missing direct constructor or guest onCreate remains explicit", () => {
	const registry = createRegistry([
		record("Lexample/Base;", "<init>", "()V", true),
		record("Landroid/content/ContentProvider;", "attachInfo", ATTACH, false)
	]);
	assert.throws(
		() => resolveProviderMethods(registry, PROVIDER),
		error => error.code === "ANDROID_PROVIDER_METHOD_REQUIRED"
	);
});

function createRegistry(records) {
	const supers = new Map([
		["Lexample/Provider;", "Lexample/Base;"],
		["Lexample/Base;", "Landroid/content/ContentProvider;"]
	]);
	return {
		list: records,
		superType(type) {
			return supers.get(type) || null;
		}
	};
}

function record(classType, name, descriptor, hasCode) {
	return {
		code: hasCode ? {} : null,
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
