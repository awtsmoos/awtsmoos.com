// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos moves every point through one explicit affine vessel. */

import { transformGeometry } from "../../geometry/transformGeometry.js";

export const CORE_TRANSFORM_MODIFIER_ID = "awtsmoos.modifier.transform";

export function executeTransformModifier({ artifact, parameters, instance }) {
	return transformGeometry(
		artifact,
		parameters,
		parameters.outputId ?? `${artifact.id}.${instance.id}`
	);
}
