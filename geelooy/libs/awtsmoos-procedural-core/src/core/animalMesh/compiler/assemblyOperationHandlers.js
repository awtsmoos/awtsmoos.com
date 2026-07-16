// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	bridgeMeshBoundaries,
	joinMeshParts,
	mirrorMeshPart,
	weldMeshVertices
} from "../geometry/meshOperations.js";
import {
	buildVertexNormals
} from "../geometry/normalBuilder.js";
import {
	readBoundaryReference,
	readPart,
	storePart
} from "./partReferences.js";

export function registerAssemblyOperationHandlers(registry) {
	registry.register("mirror_geometry", {
		handler: compileMirror
	});
	registry.register("join_meshes", {
		handler: compileJoin
	});
	registry.register("bridge_boundaries", {
		handler: compileBridge
	});
	registry.register("weld_vertices", {
		handler: compileWeld
	});
	registry.register("recalculate_normals", {
		handler: compileNormals
	});
	return registry;
}

function compileMirror(context, command) {
	const source = readPart(context, command.args?.source);
	return storePart(
		context,
		command,
		mirrorMeshPart(
			source,
			command.args?.plane || "X",
			command.args?.offset || 0
		)
	);
}

function compileJoin(context, command) {
	const sourceIds = command.args?.sources || [];
	const sources = sourceIds.map((partId) => readPart(context, partId));
	if (sources.length === 0) {
		throw new Error('B"H | join_meshes requires args.sources part ids.');
	}
	return storePart(context, command, joinMeshParts(sources));
}

function compileBridge(context, command) {
	const left = readBoundaryReference(context, command.args.boundary_a);
	const right = readBoundaryReference(context, command.args.boundary_b);
	return storePart(
		context,
		command,
		bridgeMeshBoundaries(left.part, left.boundary, right.part, right.boundary)
	);
}

function compileWeld(context, command) {
	const source = readPart(
		context,
		command.args?.source || command.target
	);
	return storePart(
		context,
		command,
		weldMeshVertices(source, command.args?.tolerance)
	);
}

function compileNormals(context, command) {
	const source = readPart(
		context,
		command.args?.source || command.target
	);
	return storePart(context, command, {
		...source,
		normals: buildVertexNormals(source.positions, source.indices)
	});
}
