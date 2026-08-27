//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkBootstrapResolver } from "../core/native/frameworkBootstrapResolver.js";
import { createJniResolverChain } from "../core/native/jniResolverChain.js";

/**
 * Proves ordered DEX-first class, field, and method resolution with fallback.
 *
 * The Awtsmoos recreates first authority, null boundary, framework answer, and
 * exact member road anew. Awtsmoos.com never lets fallback overwrite an APK
 * identity while unknown classes and members remain honestly absent.
 */
test("resolver chain prefers first class answer and falls back on null", () => {
	const dexClass = Object.freeze({ source: "dex", type: "Ljava/lang/ref/WeakReference;" });
	const chain = createJniResolverChain([
		Object.freeze({
			resolveClass(descriptor) {
				return descriptor === dexClass.type ? dexClass : null;
			}
		}),
		createFrameworkBootstrapResolver()
	]);
	assert.equal(chain.resolveClass(dexClass.type), dexClass);
	assert.equal(
		chain.resolveClass("Ljava/lang/ref/ReferenceQueue;")?.source,
		"framework"
	);
	assert.equal(chain.resolveClass("Lmissing/Class;"), null);
	assert.equal(chain.resolverCount, 2);
});

test("resolver chain preserves first field answer and later fallback", () => {
	const dexField = Object.freeze({ source: "dex-field" });
	const fallbackField = Object.freeze({ source: "framework-field" });
	const chain = createJniResolverChain([
		Object.freeze({
			resolveField(request) {
				return request.name === "dexValue" ? dexField : null;
			}
		}),
		Object.freeze({
			resolveField(request) {
				return request.name === "frameworkValue" ? fallbackField : null;
			}
		})
	]);
	assert.equal(chain.resolveField(fieldRequest("dexValue")), dexField);
	assert.equal(chain.resolveField(fieldRequest("frameworkValue")), fallbackField);
	assert.equal(chain.resolveField(fieldRequest("missing")), null);
});

test("resolver chain preserves first method answer and framework inheritance", () => {
	const dexMethod = Object.freeze({ source: "dex-method" });
	const chain = createJniResolverChain([
		Object.freeze({
			resolveMethod(request) {
				return request.name === "dexOnly" ? dexMethod : null;
			}
		}),
		createFrameworkBootstrapResolver()
	]);
	assert.equal(chain.resolveMethod(methodRequest(
		"Lexample/Test;",
		"dexOnly"
	)), dexMethod);
	const inherited = chain.resolveMethod(methodRequest(
		"Ljava/lang/ref/WeakReference;",
		"clear"
	));
	assert.equal(inherited.method.classType, "Ljava/lang/ref/Reference;");
	assert.equal(chain.resolveMethod(methodRequest(
		"Ljava/lang/ref/WeakReference;",
		"missing"
	)), null);
});

test("resolver chain rejects entries without supported resolver functions", () => {
	assert.throws(
		() => createJniResolverChain([Object.freeze({})]),
		/JNI_RESOLVER_CHAIN_ENTRY/
	);
});

function fieldRequest(name) {
	return Object.freeze({
		classDescriptor: "Lexample/Test;",
		name,
		signature: "I",
		static: false
	});
}

function methodRequest(classDescriptor, name) {
	return Object.freeze({
		classDescriptor,
		name,
		signature: "()V",
		static: false
	});
}
