// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	boundsForPositions,
	combineMeshBounds
} from "./meshBoundsReport.js";
import {
	countBoneInfluenceViolations,
	countUnweightedVertices
} from "./meshSkinReport.js";
import {
	reportMeshPartTopology
} from "./meshTopologyReport.js";

export function createAnimalMeshValidationReport(artifact, recipe) {
	const partReports = artifact.parts.map((part) => ({
		...reportMeshPartTopology(part),
		bounds: boundsForPositions(part.positions)
	}));
	const totals = summarizeParts(partReports);
	const bounds = combineMeshBounds(
		partReports.map((report) => report.bounds)
	);
	const requiredParts = recipe.validation?.required_named_parts || [];
	const availableParts = new Set(artifact.parts.map((part) => part.id));
	const maximumTriangles = recipe.validation?.maximum_triangle_count
		?? recipe.asset?.maximum_triangle_count
		?? Infinity;

	return {
		...totals,
		bounding_box: bounds,
		ground_penetration: Math.max(0, -(bounds?.minimum?.[2] || 0)),
		missing_required_parts: requiredParts.filter((id) => !availableParts.has(id)),
		unweighted_vertex_count: countUnweightedVertices(artifact.parts),
		bone_influence_violations: countBoneInfluenceViolations(
			artifact.parts,
			recipe.validation?.maximum_bone_influences || 4
		),
		deferred_operation_count: artifact.deferredCommands.length,
		within_triangle_budget: totals.triangle_count <= maximumTriangles,
		must_be_manifold_satisfied: (
			totals.open_boundary_count === 0 &&
			totals.non_manifold_edge_count === 0
		),
		glb_export_success: null
	};
}

function summarizeParts(reports) {
	return reports.reduce((summary, report) => {
		summary.vertex_count += report.vertex_count;
		summary.triangle_count += report.triangle_count;
		summary.open_boundary_count += report.open_boundary_count;
		summary.non_manifold_edge_count += report.non_manifold_edge_count;
		summary.degenerate_face_count += report.degenerate_face_count;
		return summary;
	}, {
		vertex_count: 0,
		triangle_count: 0,
		open_boundary_count: 0,
		non_manifold_edge_count: 0,
		degenerate_face_count: 0
	});
}
