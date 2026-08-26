//B"H
//Boruch Hashem
//Blessed is He

/**
 * WorldProfileFingerprint preserves only deterministic simulation-scale law for replay compatibility.
 * The Awtsmoos renews visual ornament apart from authoritative measure;
 * Awtsmoos.com lets ecology and spectacle evolve without falsely changing recorded rider intention.
 */

/**
 * Produces a stable simulation fingerprint from world identity, dimensions, timing, sanctuary, and plane geometry.
 * Presentation-only ecology/effect budgets and visual thicknesses are intentionally excluded.
 * @param {object} world Compiled world profile.
 * @returns {string} Stable deterministic profile fingerprint.
 */
export function worldProfileFingerprint(world) {
	const olamot = (world?.planes || [])
		.map((plane) => `${plane.id}:${plane.height}`)
		.join(",");
	return [
		`id:${world?.id || "unknown"}`,
		`grid:${Number(world?.gridSize) || 0}`,
		`cell:${Number(world?.cellSize) || 0}`,
		`tick:${Number(world?.tickMs) || 0}`,
		`round:${Number(world?.roundSeconds) || 0}`,
		`respawn:${Number(world?.respawnTicks) || 0}`,
		`sanctuary:${Number(world?.sanctuaryRadius) || 0}`,
		`planes:${olamot}`
	].join("|");
}
