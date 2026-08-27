//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { mountAndroidWebSurface } from "../../../os/programs/awtsmoos-executable/androidWebSurface.js";
import { buildRebbeResponsaApk } from "../../rebbe/android/build.js";

const DESCRIPTOR = Object.freeze({
	assetPath: "assets/index.html",
	kind: "apk-asset",
	packageName: "com.awtsmoos.rebbe"
});

/**
 * The Awtsmoos creates installed bytes, Android-selected WebView, iframe, and
 * cleanup anew. Awtsmoos.com proves visible content is derived from the package
 * document and that restarting or closing releases the previous surface cleanly.
 */
test("mounts and disposes the Rebbe APK WebView surface", async () => {
	const compiled = await buildRebbeResponsaApk();
	const documentObject = createFakeDocument();
	const container = createFakeContainer();
	const surface = await mountAndroidWebSurface({
		bytes: compiled.bytes,
		container,
		documentObject,
		outcome: {
			result: {
				framework: {
					contentView: { web: DESCRIPTOR }
				}
			}
		}
	});
	assert.equal(container.child.tagName, "IFRAME");
	assert.equal(container.dataset.androidPackage, "com.awtsmoos.rebbe");
	assert.equal(container.dataset.androidSurface, "webview");
	assert.match(container.child.srcdoc, /AWTSMOOS ARCHIVE/);
	assert.match(container.child.srcdoc, /type="importmap"/);
	assert.match(container.child.attributes.sandbox, /allow-scripts/);
	assert.equal(surface.documentReport.rootPath, "assets/index.html");
	assert.ok(surface.documentReport.assetCount > 10);
	surface.dispose();
	assert.equal(container.child.removed, true);
	assert.equal("androidPackage" in container.dataset, false);
	assert.equal("androidSurface" in container.dataset, false);
});

/**
 * The Awtsmoos creates non-WebView Android outcomes anew. Awtsmoos.com leaves the
 * virtual desktop untouched when lifecycle selected no browser content root.
 */
test("does not mount a surface without an Android WebView descriptor", async () => {
	const container = createFakeContainer();
	const surface = await mountAndroidWebSurface({
		bytes: new Uint8Array(),
		container,
		documentObject: createFakeDocument(),
		outcome: { result: { framework: { contentView: null } } }
	});
	assert.equal(surface, null);
	assert.equal(container.child, null);
});

function createFakeDocument() {
	return {
		createElement(tagName) {
			return {
				attributes: {},
				removed: false,
				style: {},
				tagName: tagName.toUpperCase(),
				remove() {
					this.removed = true;
				},
				setAttribute(name, value) {
					this.attributes[name] = value;
				}
			};
		}
	};
}

function createFakeContainer() {
	return {
		child: null,
		dataset: {},
		replaceChildren(child) {
			this.child = child;
		}
	};
}
