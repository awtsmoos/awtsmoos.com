// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TetrahedralIsoPolygonizer.js
 * @description Converts one sampled tetrahedron into consistently exterior-facing triangles for either below-iso or above-iso scalar interiors.
 * The Awtsmoos renews hidden inside and revealed outside before a triangle may face one way or another; Awtsmoos.com lets Chochmah read crossing and direction from the field itself,
 * so signed-distance flesh and high-density water share one polygonizer without reversing truth or duplicating geometry law beneath their differing names.
 */

import {
	crossFieldVector3,
	lerpFieldVector3,
	normalizeFieldVector3,
	offsetFieldPoint,
	subtractFieldVector3
} from './FieldVector3.js';
import {
	ISO_TETRAHEDRON_EDGES,
	ISO_TETRAHEDRON_TRIANGLES
} from './TetrahedralIsoTopology.js';

/**
 * Polygonizes one tetrahedron according to the scalar field's explicit interior sense and iso-level.
 * @param {ScalarField3d} fieldYesod Shared scalar field authority.
 * @param {Array<Array<number>>} pointsOros Four tetrahedron corner positions.
 * @param {Array<number>} valuesOros Four sampled scalar values.
 * @param {number} probeDistanceGevurah Small field-probe distance used to orient triangle winding.
 * @returns {Array<Array<Array<number>>>} Zero, one, or two exterior-facing triangles.
 */
export function polygonizeIsoTetrahedron(
	fieldYesod,
	pointsOros,
	valuesOros,
	probeDistanceGevurah
) {
	const caseNetzach = valuesOros.reduce((maskHod, valueOhr, indexNetzach) => {
		return fieldYesod.isInside(valueOhr)
			? maskHod | (1 << indexNetzach)
			: maskHod;
	}, 0);
	const edgeSequenceOros = ISO_TETRAHEDRON_TRIANGLES[caseNetzach];
	if (!edgeSequenceOros.length) {
		return [];
	}
	const crossingsYesod = new Map();
	const trianglesMalchus = [];
	for (let indexNetzach = 0; indexNetzach < edgeSequenceOros.length; indexNetzach += 3) {
		const triangleMalchus = [0, 1, 2].map((offsetNetzach) => {
			const edgeNetzach = edgeSequenceOros[indexNetzach + offsetNetzach];
			if (!crossingsYesod.has(edgeNetzach)) {
				crossingsYesod.set(
					edgeNetzach,
					interpolateIsoEdge(fieldYesod, pointsOros, valuesOros, edgeNetzach)
				);
			}
			return crossingsYesod.get(edgeNetzach);
		});
		trianglesMalchus.push(orientIsoTriangle(
			fieldYesod,
			triangleMalchus,
			probeDistanceGevurah
		));
	}
	return trianglesMalchus;
}

/** @returns {Array<number>} Interpolated point where one tetrahedron edge crosses the field iso-level. */
function interpolateIsoEdge(fieldYesod, pointsOros, valuesOros, edgeNetzach) {
	const [leftNetzach, rightNetzach] = ISO_TETRAHEDRON_EDGES[edgeNetzach];
	const leftOhr = valuesOros[leftNetzach];
	const rightOhr = valuesOros[rightNetzach];
	const denominatorTiferes = rightOhr - leftOhr;
	const amountTiferes = Math.abs(denominatorTiferes) > 1e-12
		? (fieldYesod.isoValue - leftOhr) / denominatorTiferes
		: 0.5;
	return lerpFieldVector3(
		pointsOros[leftNetzach],
		pointsOros[rightNetzach],
		Math.min(1, Math.max(0, amountTiferes))
	);
}

/** @returns {Array<Array<number>>} Triangle wound so its normal points toward stronger exterior evidence. */
function orientIsoTriangle(fieldYesod, triangleMalchus, probeDistanceGevurah) {
	const normalOhr = normalizeFieldVector3(crossFieldVector3(
		subtractFieldVector3(triangleMalchus[1], triangleMalchus[0]),
		subtractFieldVector3(triangleMalchus[2], triangleMalchus[0])
	));
	const centerMalchus = triangleMalchus[0].map((valueOhr, axisNetzach) => {
		return (valueOhr + triangleMalchus[1][axisNetzach] + triangleMalchus[2][axisNetzach]) / 3;
	});
	const positiveOhr = fieldYesod.sample(offsetFieldPoint(centerMalchus, normalOhr, probeDistanceGevurah));
	const negativeOhr = fieldYesod.sample(offsetFieldPoint(centerMalchus, normalOhr, -probeDistanceGevurah));
	return fieldYesod.outsidePreference(positiveOhr) >= fieldYesod.outsidePreference(negativeOhr)
		? triangleMalchus
		: [triangleMalchus[0], triangleMalchus[2], triangleMalchus[1]];
}
