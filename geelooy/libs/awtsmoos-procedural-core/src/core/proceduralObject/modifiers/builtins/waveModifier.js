// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos ripples finite vertices while the hidden source remains One. */

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";

export const CORE_WAVE_MODIFIER_ID = "blender.modifier.wave";

export function executeWaveModifier({ artifact, parameters, context, instance }) {
	const position = artifact.attributes?.position;
	if (!position || position.itemSize < 3) {
		throw new Error("Wave modifier requires three-component positions.");
	}
	const amplitude = Number(parameters.amplitude ?? 0.25);
	const frequency = Number(parameters.frequency ?? 1);
	const phase = Number(parameters.phase ?? 0);
	const speed = Number(parameters.speed ?? 1);
	const direction = parameters.direction ?? [1, 0];
	const time = Number(context.time ?? 0);
	const array = [...position.array];
	for (let offset = 0; offset < array.length; offset += position.itemSize) {
		const coordinate = array[offset] * direction[0] + array[offset + 1] * direction[1];
		array[offset + 2] += amplitude * Math.sin(coordinate * frequency + phase + time * speed);
	}
	return createGeometryArtifact({
		...artifact,
		id: parameters.outputId ?? `${artifact.id}.${instance.id}`,
		attributes: {
			...artifact.attributes,
			position: { ...position, array }
		}
	});
}
