// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	buildEllipticalLoft
} from "../geometry/ellipticalLoft.js";
import {
	storePart
} from "./partReferences.js";

export function registerLoftOperationHandlers(registry) {
	for (const operation of [
		"loft_elliptical_sections",
		"loft_profile_sections"
	]) {
		registry.register(operation, {
			handler: compileLoft
		});
	}
	return registry;
}

function compileLoft(context, command) {
	const guideId = command.args?.guide;
	const guide = context.recipe.anatomical_guides?.[guideId];
	if (!guide) {
		throw new Error(`B"H | Missing anatomical guide: ${guideId}`);
	}
	return storePart(
		context,
		command,
		buildEllipticalLoft(guide, command.args)
	);
}
