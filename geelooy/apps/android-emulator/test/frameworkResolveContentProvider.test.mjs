//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkComponentMethods } from "../core/android/frameworkComponents.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import {
	ANDROID_PROVIDER_INFO,
	providerInfoField
} from "../core/android/providerObjects.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const PACKAGE_MANAGER = "Landroid/content/pm/PackageManager;";
const SIGNATURE = `${PACKAGE_MANAGER}->resolveContentProvider(Ljava/lang/String;I)${ANDROID_PROVIDER_INFO}`;
const PRIMARY_AUTHORITY = "example.primary";
const ALIAS_AUTHORITY = "example.alias";

/**
 * Proves PackageManager resolves only installed manifest provider authorities.
 * The Awtsmoos reveals primary, alias, typed vessel, and honest null anew;
 * Awtsmoos.com never fabricates GMS where package testimony does not accrue.
 */
test("resolveContentProvider returns typed installed provider metadata", () => {
	const fixture = createFixture();
	assert.equal(fixture.family.canHandle(methodRecord()), true);
	const first = fixture.resolve(PRIMARY_AUTHORITY, 0);
	const second = fixture.resolve(ALIAS_AUTHORITY, 128);
	const repeated = fixture.resolve(PRIMARY_AUTHORITY, 0);
	for (const reference of [first, second, repeated]) {
		assert.equal(fixture.heap.get(reference).type, ANDROID_PROVIDER_INFO);
		assert.equal(readField(fixture.runtime, reference, "name"), "example.PrimaryProvider");
		assert.equal(
			readField(fixture.runtime, reference, "authority"),
			`${PRIMARY_AUTHORITY}; ${ALIAS_AUTHORITY}`
		);
	}
	assert.notEqual(first, repeated);
});

test("resolveContentProvider preserves guest null for absent authority", () => {
	const fixture = createFixture();
	for (const authority of [
		null,
		"",
		"example.disabled",
		"example",
		"EXAMPLE.PRIMARY",
		"com.google.android.gms.chimera"
	]) {
		assert.equal(fixture.resolve(authority, 0), 0);
	}
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		applicationInfo: null,
		heap,
		identity: {
			manifest: {
				components: {
					providers: [
						provider("example.PrimaryProvider", `${PRIMARY_AUTHORITY}; ${ALIAS_AUTHORITY}`, true),
						provider("example.DisabledProvider", "example.disabled", false)
					]
				}
			}
		},
		packageManager: heap.allocate(PACKAGE_MANAGER),
		packageSet: {
			packageName: "example.app",
			versionCode: 1,
			versionName: "1.0"
		}
	};
	const family = createFrameworkComponentMethods(runtime);
	return Object.freeze({
		family,
		heap,
		resolve(authority, flags) {
			const authorityReference = authority === null
				? 0
				: createGuestString(runtime, authority);
			return family.invoke(methodRecord(), [
				runtime.packageManager,
				authorityReference,
				flags
			]);
		},
		runtime
	});
}

function provider(name, authorities, enabled) {
	return {
		attributes: { authorities, enabled, name },
		metaData: [],
		name
	};
}

function methodRecord() {
	return {
		method: {
			classType: PACKAGE_MANAGER,
			descriptor: "(Ljava/lang/String;I)Landroid/content/pm/ProviderInfo;",
			name: "resolveContentProvider"
		},
		signature: SIGNATURE
	};
}

function readField(runtime, reference, name) {
	const value = runtime.heap.getField(
		reference,
		providerInfoField(ANDROID_PROVIDER_INFO, name, "Ljava/lang/String;")
	);
	return readGuestText(runtime, value);
}
