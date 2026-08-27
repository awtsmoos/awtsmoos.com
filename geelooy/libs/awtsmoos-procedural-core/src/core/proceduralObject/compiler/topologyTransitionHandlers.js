// B"H

import {
	compactGeometryWithIdentity,
	createTopologyIdentityArtifact,
	repairGeometryWithIdentity,
	weldGeometryWithIdentity
} from "../geometry/topology/index.js";
import { requireGeometry } from "./contextHelpers.js";
import {
	requireAuxiliaryTarget,
	requireTopologyIdentity,
	storeTopologyIdentity,
	storeTopologyRemap
} from "./topologyContextHelpers.js";

function transitionSources(context, command) {
	return {
		geometry: requireGeometry(context, command.args.source),
		identity: requireTopologyIdentity(context, command.args.identitySource)
	};
}

function storeTransition(context, command, result) {
	if (result.geometry.id !== command.target) {
		throw new Error(`Identity-aware geometry target mismatch: ${command.target}`);
	}
	context.geometries.set(command.target, result.geometry);
	storeTopologyIdentity(
		context,
		requireAuxiliaryTarget(command, "identityTarget"),
		result.identity
	);
	storeTopologyRemap(
		context,
		requireAuxiliaryTarget(command, "remapTarget"),
		result.remap
	);
	return result.geometry;
}

function compactHandler(context, command) {
	const source = transitionSources(context, command);
	return storeTransition(context, command, compactGeometryWithIdentity(
		source.geometry,
		source.identity,
		{ id: command.target }
	));
}

function weldHandler(context, command) {
	const source = transitionSources(context, command);
	return storeTransition(context, command, weldGeometryWithIdentity(
		source.geometry,
		source.identity,
		{
			id: command.target,
			tolerance: command.args.tolerance,
			policy: command.args.policy
		}
	));
}

function repairHandler(context, command) {
	const source = transitionSources(context, command);
	return storeTransition(context, command, repairGeometryWithIdentity(
		source.geometry,
		source.identity,
		{ ...command.args, id: command.target }
	));
}

/** Registers identity creation and identity-aware geometry transformations. */
export function registerTopologyTransitionHandlers(registry) {
	registry.register("create_topology_identity", {
		handler: (context, command) => storeTopologyIdentity(
			context,
			command.target,
			createTopologyIdentityArtifact(
				requireGeometry(context, command.args.source),
				{ identitySeed: command.args.identitySeed, metadata: command.args.metadata }
			)
		)
	});
	registry.register("compact_geometry_with_identity", { handler: compactHandler });
	registry.register("weld_geometry_with_identity", { handler: weldHandler });
	registry.register("repair_geometry_with_identity", { handler: repairHandler });
	return registry;
}
