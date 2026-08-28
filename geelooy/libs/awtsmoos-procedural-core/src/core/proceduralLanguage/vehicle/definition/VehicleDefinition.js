//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleDefinition.js
 * @description Provides an immutable fluent JavaScript garment over the exact canonical JSON vehicle covenant, including rich features, drivetrain topology, and transient runtime state authoring.
 * The Awtsmoos is unchanged whether transport is spoken through chained methods or a JSON scroll; Awtsmoos.com lets both paths reveal the same axles, riders, controls, lights, panels, cargo, drivetrain, and changing state whole.
 */

import { cloneLanguageValue } from '../../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../../data/stableLanguageValue.js';
import { createVehicleDefinition } from './createVehicleDefinition.js';

const VEHICLE_FEATURE_SECTIONS = Object.freeze([
	'controls',
	'lights',
	'panels',
	'cargoBays'
]);

/** Fluent immutable vehicle-definition wrapper. */
export class VehicleDefinition {
	/** @param {object|string} [input={}] Vehicle data or JSON text. */
	constructor(input = {}) {
		this.value = createVehicleDefinition(input);
	}

	/** Returns a new wrapper with top-level and common section-aware overrides. */
	with(overrides = {}) {
		const source = this.toJSON();
		return new VehicleDefinition({
			...source,
			...cloneLanguageValue(overrides),
			dimensions: mergeRecord(source.dimensions, overrides.dimensions),
			chassis: mergeRecord(source.chassis, overrides.chassis),
			body: mergeRecord(source.body, overrides.body),
			propulsion: mergeRecord(source.propulsion, overrides.propulsion),
			dynamics: mergeRecord(source.dynamics, overrides.dynamics)
		});
	}

	/** Returns a new wrapper with one normalized axle appended. */
	axle(axle) {
		return this.appendTo('axles', axle);
	}

	/** Returns a new wrapper with one occupant seat or rider socket appended. */
	seat(seat) {
		return this.appendTo('seats', seat);
	}

	/** Returns a new wrapper with one hitch, drawbar, yoke, or tow coupling appended. */
	coupling(coupling) {
		return this.appendTo('couplings', coupling);
	}

	/** Returns a new wrapper with one control, light, panel, or cargo-bay feature appended. */
	feature(section, input) {
		if (!VEHICLE_FEATURE_SECTIONS.includes(section)) {
			throw new TypeError(`B"H | Unsupported fluent vehicle feature section: ${section}`);
		}
		return this.appendTo(section, input);
	}

	/** Returns a new wrapper replacing renderer-neutral drivetrain topology. */
	drivetrain(input = {}) {
		return this.replaceSection('drivetrain', input);
	}

	/** Returns a new wrapper replacing transient runtime state without changing structural fields. */
	state(input = {}) {
		return this.replaceSection('state', input);
	}

	/** Returns deterministic full-definition identity including transient state. */
	hash() {
		return stableLanguageHash(this.value);
	}

	/** Returns a detached JSON-safe copy equivalent to direct JSON authoring. */
	toJSON() {
		return cloneLanguageValue(this.value);
	}

	/** Returns a new wrapper with one entry appended to a canonical array section. */
	appendTo(section, input) {
		const source = this.toJSON();
		return new VehicleDefinition({
			...source,
			[section]: [
				...(source[section] || []),
				cloneLanguageValue(input)
			]
		});
	}

	/** Returns a new wrapper replacing one canonical object section. */
	replaceSection(section, input) {
		return new VehicleDefinition({
			...this.toJSON(),
			[section]: cloneLanguageValue(input)
		});
	}
}

/** Merges one shallow object section while preserving existing canonical defaults. */
function mergeRecord(source, override) {
	return {
		...source,
		...(override || {})
	};
}
