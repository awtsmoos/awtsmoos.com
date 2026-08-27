//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	readManifestComponents,
	resolveManifestLauncher
} from "../core/apk/manifestComponents.js";

/**
 * Proves manifest component parsing preserves metadata and launcher identity.
 * The Awtsmoos recreates XML node, component, key, and value anew; Awtsmoos.com
 * keeps every registrar record immutable and package-qualified.
 */
test("service metadata is preserved as immutable records", () => {
	const components = readManifestComponents(applicationNode(), "example.app");
	const service = components.services[0];
	assert.equal(service.name, "example.app.DiscoveryService");
	assert.deepEqual(service.metaData[0], {
		attributes: { name: "registrar:one", value: "Registrar" },
		name: "registrar:one",
		resource: null,
		value: "Registrar"
	});
	assert.throws(() => service.metaData.push({}), TypeError);
});

test("launcher aliases resolve to target activity", () => {
	const components = readManifestComponents(applicationNode(), "example.app");
	assert.equal(resolveManifestLauncher(components), "example.app.MainActivity");
});

function applicationNode() {
	return node("application", {}, [
		node("service", { name: ".DiscoveryService", exported: false }, [
			node("meta-data", { name: "registrar:one", value: "Registrar" })
		]),
		node("activity-alias", {
			name: ".Launcher",
			targetActivity: ".MainActivity"
		}, [
			node("intent-filter", {}, [
				node("action", { name: "android.intent.action.MAIN" }),
				node("category", { name: "android.intent.category.LAUNCHER" })
			])
		])
	]);
}

function node(name, attributes = {}, children = []) {
	return {
		attributes: Object.entries(attributes).map(([localName, value]) => ({
			localName,
			value
		})),
		children,
		name
	};
}
