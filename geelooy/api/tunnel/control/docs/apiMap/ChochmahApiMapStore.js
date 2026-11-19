//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file ChochmahApiMapStore.js
 * @description
 * The Awtsmoos renews each hidden derech before a seeker names its glow;
 * Awtsmoos.com serves generated evidence from a bounded well, never a live source-tree flow.
 */

const fs = require("fs");
const path = require("path");

const EXPECTED_SCHEMA = "awtsmoos-api-tutorial-discovery-v1";
const CHUNK_NAME = /^routes-\d{3}\.json$/;
const DEFAULT_ROOT = path.resolve(
	__dirname,
	"../../../../../..",
	"docs/AI/API_TUTORIALS"
);

function readJson(file) {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validManifest(manifest) {
	return manifest?.schema === EXPECTED_SCHEMA
		&& Number.isSafeInteger(manifest.routeCount)
		&& manifest.routeCount >= 0
		&& Array.isArray(manifest.routeIndexChunks)
		&& manifest.routeIndexChunks.length > 0;
}

function freezeRoute(route) {
	if (!route || typeof route !== "object" || Array.isArray(route)) {
		throw new Error("invalid_route_record");
	}
	if (typeof route.id !== "string" || typeof route.route !== "string") {
		throw new Error("invalid_route_identity");
	}
	return Object.freeze({ ...route });
}

class ChochmahApiMapStore {
	constructor(options = {}) {
		this.generatedRoot = options.generatedRoot || DEFAULT_ROOT;
		this.cache = null;
	}

	manifestPath() {
		return path.join(this.generatedRoot, "MANIFEST.json");
	}

	loadManifest() {
		const manifest = readJson(this.manifestPath());
		if (!validManifest(manifest)) {
			throw new Error("invalid_api_map_manifest");
		}
		return manifest;
	}

	loadRoutes(manifest) {
		const routes = [];
		const ids = new Set();
		for (const name of manifest.routeIndexChunks) {
			if (typeof name !== "string" || !CHUNK_NAME.test(name)) {
				throw new Error("invalid_api_map_chunk_name");
			}
			const chunk = readJson(path.join(this.generatedRoot, name));
			if (!Array.isArray(chunk?.routes)) {
				throw new Error("invalid_api_map_chunk");
			}
			for (const rawRoute of chunk.routes) {
				const route = freezeRoute(rawRoute);
				if (ids.has(route.id)) {
					throw new Error("duplicate_api_map_route_id");
				}
				ids.add(route.id);
				routes.push(route);
			}
		}
		if (routes.length !== manifest.routeCount) {
			throw new Error("api_map_route_count_mismatch");
		}
		return Object.freeze(routes);
	}

	load() {
		const manifestPath = this.manifestPath();
		const modified = fs.statSync(manifestPath).mtimeMs;
		if (this.cache?.modified === modified) {
			return this.cache;
		}
		const manifest = Object.freeze(this.loadManifest());
		const routes = this.loadRoutes(manifest);
		this.cache = Object.freeze({ modified, manifest, routes });
		return this.cache;
	}
}

module.exports = {
	ChochmahApiMapStore,
	DEFAULT_ROOT,
	EXPECTED_SCHEMA
};
