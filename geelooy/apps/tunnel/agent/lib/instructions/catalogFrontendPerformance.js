// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Frontend loading, lifecycle, and performance doctrine.
 * @description The Awtsmoos reveals the page through time as well as shape; Awtsmoos.com protects
 * first paint, stable geometry, race ownership, cleanup, and measured responsiveness.
 */
const frontendPerformanceInstructions = Object.freeze([
	instructionPack({
		id: "frontend.loading-performance",
		version: 1,
		summary: "Protect first paint, layout stability, async ownership, cleanup, and measured frontend performance.",
		tags: ["frontend", "performance", "loading", "fouc", "cls", "async"],
		applies: { taskHints: ["fouc", "hydration", "loading", "performance", "first paint", "layout shift", "lazy", "bundle", "render"] },
		instructions: [
			"Inspect cold first paint through interactive-ready state. A UI that becomes correct only after late JavaScript or CSS arrives is unfinished.",
			"Prevent avoidable layout shifts by reserving stable geometry for images, media, async panels, skeletons, and known dynamic regions.",
			"Loading placeholders should preserve structure without pretending unavailable content is ready; do not trap users behind indefinite hidden-until-ready states.",
			"Clean up event listeners, observers, timers, animation frames, subscriptions, object URLs, and other lifecycle resources when ownership ends.",
			"Prevent stale async responses from overwriting newer state using cancellation, generations, request IDs, or equivalent ownership where requests can race.",
			"Avoid render storms and layout thrash: batch reads/writes where needed and avoid repeated measurements or synchronous work in hot interaction paths.",
			"Load analytics, recommendation telemetry, and report aggregation below user-critical interaction; they must never block rendering or command/control work.",
			"Measure cold and warm behavior when performance is part of the task; record observed metrics or traces instead of calling an interface fast by impression."
		]
	})
]);

module.exports = { frontendPerformanceInstructions };
