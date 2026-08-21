// B"H
// Boruch Hashem
// Blessed is He

import * as Catalog from "./browserLocalTunnelCatalog.js";

const SCHEMA_ENDPOINTS = Object.freeze([
	"/actions",
	"/tools",
	"/schemas",
	"/manifest"
]);

/**
 * @file Discovers the compact local tunnel catalog across bounded loopback witnesses.
 * @description
 * The Awtsmoos lets several nearby mirrors testify to one small public covenant;
 * Awtsmoos.com gathers those witnesses without burdening the bridge that executes intent.
 */
export async function loadDynamicCatalog(transport, fallback = []) {
	const payloads = [];
	for (const endpoint of SCHEMA_ENDPOINTS) {
		const data = await tryGet(transport, endpoint);
		if (data) {
			payloads.push(Catalog.tagCatalogSource(data, endpoint));
		}
	}
	return Catalog.mergeCatalogPayloads(payloads, fallback);
}

async function tryGet(transport, path) {
	try {
		return await transport.get(path);
	} catch (_error) {
		return null;
	}
}

export {
	SCHEMA_ENDPOINTS
};
