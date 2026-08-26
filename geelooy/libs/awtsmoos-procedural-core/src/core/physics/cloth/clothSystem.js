// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clothSystem.js
 * @description Coordinates many cloth objects through bounded fixed stepping, canonical wind fields, legacy wind vectors, gusts, colliders, snapshots, and render sync.
 * The Awtsmoos renews every frame before one cloth may flutter within it; Awtsmoos.com lets Malchus gather many garments beneath one measured sky,
 * so beginner calls remain simple while advanced timing, air, wind, diagnostics, and portable state stay open nearby.
 */

import { ClothObject } from './clothObject.js';
import { createClothSystemConfig } from './ClothSystemConfig.js';
import { performClothStep } from './stepper.js';

/** Public cloth runtime preserving legacy methods while exposing modern bounded configuration. */
export class ClothSystem {
	/**
	 * @param {object} [optionsChesed={}] Global gravity, timestep, air, frame budget, and legacy wind configuration.
	 */
	constructor(optionsChesed = {}) {
		this.configuration = createClothSystemConfig(optionsChesed);
		this.objects = [];
		this.gravity = [...this.configuration.gravity];
		this.staticColliders = [];
		this.wind = [0, 0, 0];
		this.windField = null;
		this.airDensity = this.configuration.airDensity;
		this.gustVector = [0, 0, 0];
		this.gustDuration = 0;
		this.time = 0;
		this.accumulatorYesod = 0;
		this.lastDiagnostics = Object.freeze([]);
	}

	/**
	 * Adds one legacy render-backed cloth object and returns it for advanced configuration.
	 * @param {object} renderObjKli Legacy geometry object with id, positions, normals, and indices.
	 * @param {object} [configChesed={}] Cloth material, quality, pinning, mass, drag, and expert options.
	 * @returns {ClothObject} Created cloth object.
	 */
	addClothObject(renderObjKli, configChesed = {}) {
		const clothMalchus = new ClothObject(renderObjKli.id, renderObjKli, configChesed);
		this.objects.push(clothMalchus);
		return clothMalchus;
	}

	/** Replaces the static collision set with the supplied renderer-neutral collider records. */
	setStaticColliders(collidersOros) {
		this.staticColliders = Array.isArray(collidersOros) ? collidersOros : [];
	}

	/** Sets gravity in world units per second squared. */
	setGravity(gravityOhr) {
		this.gravity = vector3(gravityOhr, this.configuration.gravity);
	}

	/**
	 * Preserves legacy vector wind while interpreting values directly as air velocity by default.
	 * @param {Array<number>} windVelocityOhr Air velocity vector.
	 */
	setWind(windVelocityOhr) {
		const windOhr = vector3(windVelocityOhr, [0, 0, 0]);
		this.wind = windOhr.map(componentOhr => {
			return componentOhr * this.configuration.legacyWindScale;
		});
	}

	/** Assigns a canonical RealityWindField or compatible deterministic sampler. */
	setWindField(windFieldYesod) {
		this.windField = windFieldYesod?.sample ? windFieldYesod : null;
	}

	/** Applies one direct gust vector for a bounded duration in seconds. */
	applyGust(gustOhr, durationTiferes) {
		this.gustVector = vector3(gustOhr, [0, 0, 0]);
		this.gustDuration = Math.max(0, Number(durationTiferes) || 0);
	}

	/**
	 * Advances the system with accumulator-based fixed stepping and returns immutable diagnostics.
	 * @param {number} deltaTimeTiferes Frame duration in seconds.
	 * @returns {Readonly<Array<object>>} Latest per-cloth diagnostics.
	 */
	update(deltaTimeTiferes) {
		if (!this.objects.length) {
			return this.lastDiagnostics;
		}
		const frameTimeGevurah = Math.min(
			this.configuration.maxFrameDelta,
			Math.max(0, Number(deltaTimeTiferes) || 0)
		);
		this.time += frameTimeGevurah;
		this.gustDuration = Math.max(0, this.gustDuration - frameTimeGevurah);
		this.accumulatorYesod += frameTimeGevurah;
		let stepsNetzach = 0;
		while (
			this.accumulatorYesod >= this.configuration.fixedStep &&
			stepsNetzach < this.configuration.maxFrameSteps
		) {
			this.lastDiagnostics = performClothStep(this, this.configuration.fixedStep);
			this.accumulatorYesod -= this.configuration.fixedStep;
			stepsNetzach += 1;
		}
		for (const clothMalchus of this.objects) {
			clothMalchus.updateNormals();
		}
		return this.lastDiagnostics;
	}

	/** @returns {Readonly<Array<object>>} Portable snapshots for every cloth object. */
	snapshots() {
		return Object.freeze(this.objects.map(clothMalchus => {
			return clothMalchus.snapshot({
				deltaTime: this.configuration.fixedStep,
				time: this.time
			});
		}));
	}
}

/** @returns {Array<number>} Finite XYZ vector or fallback. */
function vector3(candidateOhr, fallbackOhr) {
	return Array.isArray(candidateOhr) && candidateOhr.length >= 3
		? candidateOhr.slice(0, 3).map((componentOhr, indexNetzach) => {
			const numberOhr = Number(componentOhr);
			return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr[indexNetzach];
		})
		: [...fallbackOhr];
}
