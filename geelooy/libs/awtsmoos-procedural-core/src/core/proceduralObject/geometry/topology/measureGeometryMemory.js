// B"H

import { createMeasurementReport } from "../../foundation/measurements/index.js";

const COMPONENT_BYTES = Object.freeze({
	float32: 4,
	float64: 8,
	int8: 1,
	uint8: 1,
	int16: 2,
	uint16: 2,
	int32: 4,
	uint32: 4
});

function attributeBytes(attributes) {
	return Object.values(attributes).reduce((total, attribute) => (
		total + attribute.array.length * COMPONENT_BYTES[attribute.componentType]
	), 0);
}

/** Reports exact declared numeric storage and structural counts for geometry. */
export function measureGeometryMemory(geometry) {
	const attributeStorage = attributeBytes(geometry.attributes ?? {});
	const morphTargetStorage = Object.values(geometry.morphTargets ?? {})
		.reduce((total, attributes) => total + attributeBytes(attributes), 0);
	const indexStorage = geometry.indices
		? geometry.indices.array.length * COMPONENT_BYTES[geometry.indices.componentType]
		: 0;
	const indexCount = geometry.indices?.array.length ?? 0;
	return createMeasurementReport({
		subject: { geometryId: geometry.id },
		measurements: {
			attributeBytes: attributeStorage,
			morphTargetBytes: morphTargetStorage,
			indexBytes: indexStorage,
			totalBytes: attributeStorage + morphTargetStorage + indexStorage,
			vertexCount: geometry.attributes?.position?.count ?? 0,
			indexCount,
			faceCount: geometry.topology === "triangles" ? indexCount / 3 : 0,
			attributeCount: Object.keys(geometry.attributes ?? {}).length,
			morphTargetCount: Object.keys(geometry.morphTargets ?? {}).length
		},
		metadata: { topology: geometry.topology }
	});
}
