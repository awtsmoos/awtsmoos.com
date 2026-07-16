// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

const WIDTH_VIEWS = new Set([
	"front",
	"rear",
	"front_three_quarter",
	"rear_three_quarter"
]);
const DEPTH_VIEWS = new Set([
	"left",
	"right",
	"front_three_quarter",
	"rear_three_quarter"
]);

export function analyzeAnimalReferences(references = []) {
	const viewCounts = new Map();
	let confidenceTotal = 0;
	let confidenceCount = 0;

	for (const reference of references) {
		viewCounts.set(reference.view, (viewCounts.get(reference.view) || 0) + 1);
		for (const confidence of [
			reference.orthographic_confidence,
			reference.pose_consistency
		]) {
			if (Number.isFinite(confidence)) {
				confidenceTotal += confidence;
				confidenceCount += 1;
			}
		}
	}
	const views = new Set(viewCounts.keys());
	return {
		image_count: references.length,
		views: Array.from(views).sort(),
		duplicate_views: Array.from(viewCounts.entries())
			.filter(([, count]) => count > 1)
			.map(([view]) => view),
		width_coverage: intersects(views, WIDTH_VIEWS),
		depth_coverage: intersects(views, DEPTH_VIEWS),
		height_coverage: references.some((reference) => {
			return reference.usable_for_height !== false;
		}),
		bilateral_coverage: views.has("left") && views.has("right"),
		rear_coverage: views.has("rear") || views.has("rear_three_quarter"),
		average_confidence: confidenceCount > 0
			? confidenceTotal / confidenceCount
			: null,
		recommended_missing_views: recommendedMissingViews(views)
	};
}

function intersects(left, right) {
	for (const value of left) {
		if (right.has(value)) {
			return true;
		}
	}
	return false;
}

function recommendedMissingViews(views) {
	const missing = [];
	if (!views.has("front")) {
		missing.push("front");
	}
	if (!views.has("left") && !views.has("right")) {
		missing.push("left_or_right");
	}
	if (!views.has("rear") && !views.has("rear_three_quarter")) {
		missing.push("rear_or_rear_three_quarter");
	}
	return missing;
}
