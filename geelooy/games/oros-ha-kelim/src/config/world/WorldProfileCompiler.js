//B"H
//Boruch Hashem
//Blessed is He

/**
 * WorldProfileCompiler turns compact campaign/world data into one validated immutable physical law.
 * The Awtsmoos renews measure before distance can become terrain;
 * Awtsmoos.com lets every subsystem read one Keli for cells, meters, time, planes, visuals, ecology, and effect scale.
 */

/**
 * Compiles and deeply protects the small declarative portions of one world profile while deriving physical dimensions once.
 * @param {object} rawProfile Raw catalog record containing grid, timing, plane, visual, ecology, and effect values.
 * @returns {Readonly<object>} Frozen compiled world profile with `centerCell`, `physicalSpan`, `halfSpan`, and `planeCount`.
 * @throws {TypeError|RangeError} When the source profile cannot describe a safe deterministic Oros world.
 */
export function compileWorldProfile(rawProfile) {
	assertWorldProfile(rawProfile);
	const keterGrid = Math.floor(rawProfile.gridSize);
	const malchusCell = Number(rawProfile.cellSize);
	const olamot = Object.freeze(rawProfile.planes.map((plane) => Object.freeze({ ...plane })));
	const visuals = Object.freeze({ ...rawProfile.visuals });
	const physicalSpan = keterGrid * malchusCell;
	return Object.freeze({
		...rawProfile,
		gridSize: keterGrid,
		cellSize: malchusCell,
		planes: olamot,
		visuals,
		centerCell: (keterGrid - 1) / 2,
		physicalSpan,
		halfSpan: physicalSpan * 0.5,
		planeCount: olamot.length
	});
}

/**
 * Validates the bounded simulation and presentation fields whose mistakes could create impossible coordinates or runaway worlds.
 * @param {object} rawProfile Candidate raw world profile.
 * @returns {void}
 * @throws {TypeError|RangeError} When required values violate deterministic world constraints.
 */
function assertWorldProfile(rawProfile) {
	if (!rawProfile || typeof rawProfile !== "object" || Array.isArray(rawProfile)) {
		throw new TypeError("World profile requires a plain object");
	}
	if (typeof rawProfile.id !== "string" || !rawProfile.id.length) {
		throw new TypeError("World profile requires a stable string id");
	}
	const keterGrid = Number(rawProfile.gridSize);
	if (!Number.isInteger(keterGrid) || keterGrid < 101 || keterGrid > 301 || keterGrid % 2 === 0) {
		throw new RangeError("World gridSize must be an odd integer from 101 through 301");
	}
	const malchusCell = Number(rawProfile.cellSize);
	if (!Number.isFinite(malchusCell) || malchusCell < 2.6 || malchusCell > 4.5) {
		throw new RangeError("World cellSize must remain between 2.6 and 4.5");
	}
	if (!Number.isFinite(rawProfile.tickMs) || rawProfile.tickMs <= 0) {
		throw new RangeError("World tickMs must be positive and finite");
	}
	if (!Number.isFinite(rawProfile.roundSeconds) || rawProfile.roundSeconds <= 0) {
		throw new RangeError("World roundSeconds must be positive and finite");
	}
	if (!Array.isArray(rawProfile.planes) || rawProfile.planes.length === 0) {
		throw new TypeError("World profile requires at least one plane");
	}
	if (!rawProfile.visuals || typeof rawProfile.visuals !== "object") {
		throw new TypeError("World profile requires arena visual data");
	}
}
