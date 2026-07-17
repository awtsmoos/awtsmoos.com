//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaObjectMethods } from "../core/android/frameworkJavaObjects.js";
import { createJavaLocale } from "../core/android/frameworkJavaLocaleValues.js";
import { readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves resource-compatible Java Locale values. The Awtsmoos renews language,
 * region, script, default, and tag; Awtsmoos.com keeps arbitrary APK configuration
 * on one immutable metadata road rather than returning a hard-coded language.
 */
test("Locale reads Android resource language and region fields", () => {
	const fixture = createLocaleFixture();
	const locale = fixture.heap.allocate("Ljava/util/Locale;", {
		"java:locale:language": "he",
		"java:locale:region": "IL"
	});
	assert.equal(fixture.text("getLanguage", locale), "he");
	assert.equal(fixture.text("getCountry", locale), "IL");
	assert.equal(fixture.text("toLanguageTag", locale), "he-IL");
	assert.equal(fixture.text("toString", locale), "he_IL");
});

test("Locale constructors normalize language, region, and variant", () => {
	const fixture = createLocaleFixture();
	const locale = fixture.heap.allocate("Ljava/util/Locale;");
	fixture.call(
		"<init>",
		"(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
		[locale, "EN", "us", "POSIX"]
	);
	assert.equal(fixture.text("getLanguage", locale), "en");
	assert.equal(fixture.text("getCountry", locale), "US");
	assert.equal(fixture.text("getVariant", locale), "POSIX");
	assert.equal(fixture.text("toLanguageTag", locale), "en-US-POSIX");
});

test("Locale parses language tags and preserves value equality", () => {
	const fixture = createLocaleFixture();
	const parsed = fixture.call(
		"forLanguageTag",
		"(Ljava/lang/String;)Ljava/util/Locale;",
		["zh-Hant-TW"]
	);
	assert.equal(fixture.text("getLanguage", parsed), "zh");
	assert.equal(fixture.text("getScript", parsed), "Hant");
	assert.equal(fixture.text("getCountry", parsed), "TW");
	const equal = createJavaLocale(fixture.runtime, {
		language: "zh",
		region: "TW",
		script: "Hant"
	});
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [parsed, equal]), 1);
	assert.equal(fixture.call("hashCode", "()I", [parsed]), fixture.call("hashCode", "()I", [equal]));
});

test("Locale default follows runtime resource language and can change", () => {
	const fixture = createLocaleFixture("fr");
	const first = fixture.call("getDefault", "()Ljava/util/Locale;", []);
	assert.equal(fixture.text("getLanguage", first), "fr");
	const second = createJavaLocale(fixture.runtime, { language: "de" });
	fixture.call("setDefault", "(Ljava/util/Locale;)V", [second]);
	assert.equal(fixture.call("getDefault", "()Ljava/util/Locale;", []), second);
});

function createLocaleFixture(language = "en") {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		resources: {
			configuration: { language }
		}
	};
	const methods = createFrameworkJavaObjectMethods(runtime);
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	return Object.freeze({
		call,
		heap,
		runtime,
		text(name, locale) {
			const descriptor = name === "toLanguageTag"
				? "()Ljava/lang/String;"
				: "()Ljava/lang/String;";
			return readGuestText(runtime, call(name, descriptor, [locale]));
		}
	});
}

function methodRecord(name, descriptor) {
	const classType = "Ljava/util/Locale;";
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
