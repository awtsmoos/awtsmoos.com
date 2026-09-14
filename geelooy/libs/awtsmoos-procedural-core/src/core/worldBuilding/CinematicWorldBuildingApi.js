//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicWorldBuildingApi.js
 * @description Public high-level world doorway shared by games, Studio, and future Awtsmoos products.
 * The Awtsmoos renews one reality before terrain, water, sky, and material divide; this API accepts
 * declarative intent while reusable geometry, remote imagery, shaders, and native materialization stay in Core.
 */
import { createTerrainApi } from '../terrain/TerrainApi.js';
import { createCinematicEnvironment } from './CinematicEnvironment.js';
import { createCinematicSkyMesh } from './CinematicSkyMesh.js';
import {
	createCinematicTerrainMesh,
	createCinematicTerrainMeshFromGeometry
} from './CinematicTerrainMesh.js';
import { createCinematicWaterMesh } from './CinematicWaterMesh.js';

export class CinematicWorldBuildingApi {
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
	}

	/** Resolve deterministic portable terrain truth once so adapters never regenerate geometry. */
	terrainPlan(options = {}) {
		const merged = { ...this.defaults, ...options };
		return merged.plan || createTerrainApi(merged).terrain(merged);
	}

	/** Materialize one Core-owned terrain mesh from semantic intent or an existing portable plan. */
	terrain(options = {}) {
		const merged = { ...this.defaults, ...options };
		return createCinematicTerrainMesh(this.terrainPlan(merged), merged);
	}

	/** Materialize caller-supplied portable geometry without transferring renderer authority. */
	terrainGeometry(data = {}, options = {}) {
		return createCinematicTerrainMeshFromGeometry(
			data,
			{ ...this.defaults, ...options }
		);
	}

	/** Create shared physical water whose base material image comes from Awtsmoos Drive. */
	water(options = {}) {
		return createCinematicWaterMesh({ ...this.defaults, ...options });
	}

	/** Create the shared physical-atmosphere mesh; procedural shader law is intentional here. */
	sky(options = {}) {
		return createCinematicSkyMesh({ ...this.defaults, ...options });
	}

	/** Resolve one renderer environment contract from semantic cinematic lighting intent. */
	environment(options = {}) {
		return createCinematicEnvironment({ ...this.defaults, ...options });
	}

	/** Build one coherent Core world and expose the readiness barrier plus the exact generated terrain plan. */
	world(options = {}) {
		const merged = { ...this.defaults, ...options };
		const terrainOptions = resolveTerrainOptions(merged);
		const terrainPlan = terrainOptions ? this.terrainPlan(terrainOptions) : null;
		const terrain = terrainPlan ? this.terrain({ ...terrainOptions, plan: terrainPlan }) : null;
		const sky = merged.sky === false ? null : this.sky(merged.sky || merged);
		const waters = (merged.waters || []).map(water => this.water(water));
		const readiness = [
			terrain?.userData?.awtsmoosReady,
			...waters.map(mesh => mesh.userData?.awtsmoosReady)
		].filter(Boolean);
		return Object.freeze({
			environment: this.environment(merged.environment || merged),
			ready: Promise.all(readiness),
			sky,
			terrain,
			terrainPlan,
			waters: Object.freeze(waters)
		});
	}

	/** Derive a sibling API with immutable defaults while preserving this public authority boundary. */
	with(overrides = {}) {
		return new CinematicWorldBuildingApi({ ...this.defaults, ...overrides });
	}
}

function resolveTerrainOptions(options) {
	if (options.terrain === false) return null;
	return options.terrain && typeof options.terrain === 'object' ? options.terrain : options;
}

/** Creates the shared high-level world-building API. */
export function createCinematicWorldBuildingApi(defaults = {}) {
	return new CinematicWorldBuildingApi(defaults);
}
