//B"H
//Boruch Hashem
//Blessed is He

/**
 * WorldProfileCatalog describes scale, time, navigation density, ecology budget, and effect amplitude as immutable data.
 * The Awtsmoos renews every Olam before width or duration can contain it;
 * Awtsmoos.com lets campaign nodes choose a world without scattering physical constants across the codebase.
 */

export const WORLD_PLANES = Object.freeze([
	Object.freeze({ id: "asiyah", name: "Asiyah", height: 0, tint: 0x163647 }),
	Object.freeze({ id: "yetzirah", name: "Yetzirah", height: 13, tint: 0x273b6a }),
	Object.freeze({ id: "beriah", name: "Beriah", height: 26, tint: 0x4b361c })
]);

const PROFILE_BASE = Object.freeze({
	tickMs: 96,
	respawnTicks: 16,
	sanctuaryRadius: 2,
	planes: WORLD_PLANES
});

/**
 * Builds one small immutable raw profile record before validation/derived metrics are added by the compiler.
 * @param {object} values Profile-specific scale, timing, visual, ecology, and effect values.
 * @returns {Readonly<object>} Frozen raw profile record.
 */
function rawWorldProfile(values) {
	return Object.freeze({ ...PROFILE_BASE, ...values, visuals: Object.freeze({ ...values.visuals }) });
}

export const WORLD_PROFILE_CATALOG = Object.freeze({
	freeplay: rawWorldProfile({
		id: "freeplay", name: "Great Field", gridSize: 181, cellSize: 3.6, roundSeconds: 420,
		ecologyBudget: 1, effectScale: 1,
		visuals: { minorGridStep: 6, majorGridStep: 30, minorThickness: 0.034, majorThickness: 0.082, boundaryThickness: 0.24, boundaryHeight: 0.24, gateBeaconHeight: 24, gateBeaconWidth: 0.2 }
	}),
	river: rawWorldProfile({
		id: "river", name: "River of Formation", gridSize: 221, cellSize: 3.45, roundSeconds: 450,
		ecologyBudget: 1.18, effectScale: 1.08,
		visuals: { minorGridStep: 7, majorGridStep: 35, minorThickness: 0.034, majorThickness: 0.084, boundaryThickness: 0.25, boundaryHeight: 0.25, gateBeaconHeight: 28, gateBeaconWidth: 0.21 }
	}),
	crown: rawWorldProfile({
		id: "crown", name: "Crown Expanse", gridSize: 257, cellSize: 3.3, roundSeconds: 480,
		ecologyBudget: 1.32, effectScale: 1.16,
		visuals: { minorGridStep: 8, majorGridStep: 40, minorThickness: 0.035, majorThickness: 0.088, boundaryThickness: 0.26, boundaryHeight: 0.27, gateBeaconHeight: 32, gateBeaconWidth: 0.22 }
	})
});
