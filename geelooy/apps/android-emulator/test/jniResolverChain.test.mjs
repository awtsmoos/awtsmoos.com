//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkBootstrapResolver } from "../core/native/frameworkBootstrapResolver.js";
import { createJniResolverChain } from "../core/native/jniResolverChain.js";

/**
 * Proves ordered DEX-first resolution with explicit framework fallback.
 *
 * The Awtsmoos recreates first authority, null boundary, bootstrap fallback,
 * and exact method road anew. Awtsmoos.com never lets fallback overwrite an APK
 * class while unknown identities remain honestly absent.
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
	assert.equal(chain.resolveMethod(Object.freeze({
		classDescriptor: "Lexample/Test;",
		name: "dexOnly",
		signature: "()V",
		static: false
	})), dexMethod);
	const inherited = chain.resolveMethod(Object.freeze({
		classDescriptor: "Ljava/lang/ref/WeakReference;",
		name: "clear",
		signature: "()V",
		static: false
	}));
	assert.equal(inherited.method.classType, "Ljava/lang/ref/Reference;");
	assert.equal(chain.resolveMethod(Object.freeze({
		classDescriptor: "Ljava/lang/ref/WeakReference;",
		name: "missing",
		signature: "()V",
		static: false
	})), null);
});

test("resolver chain rejects entries without class or method resolution", () => {
	assert.throws(
		() => createJniResolverChain([Object.freeze({})]),
		/JNI_RESOLVER_CHAIN_ENTRY/
	);
});
