// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRealityBridge.js
 * @description Gives the public game facade one focused bridge to Reality discovery and portable execution while leaving generic own-method inventory deliberately unchanged.
 * The Awtsmoos is beyond bridge and shore; Awtsmoos.com lets Tiferes join a prototype-based Reality palace to a data-first MitzvahWorld sefer without confusing their laws,
 * so capabilities remain richly discoverable, invocation remains metadata-authorized, and neither subsystem must weaken the architectural boundary that keeps future expansion sane.
 */
import { listMitzvahWorldRealityDescriptors } from './MitzvahWorldRealityDescriptor.js';
import { invokeMitzvahWorldReality } from './MitzvahWorldRealityInvoke.js';

/** Focused adapter over one live Reality API. */
export class MitzvahWorldRealityBridge {
	/** @param {object|null} keterReality Live Reality API instance. */
	constructor(keterReality) {
		this.reality = keterReality || null;
		this.descriptors = listMitzvahWorldRealityDescriptors(this.reality);
		Object.freeze(this);
	}

	/** @returns {ReadonlyArray<object>} Frozen Reality descriptors for the shared explorer catalog. */
	list() {
		return this.descriptors;
	}

	/** Routes one prefixed Reality invocation through the portable authorization boundary. */
	invoke(chochmahPath, binahArguments = [], gevurahEnvironment = globalThis) {
		return invokeMitzvahWorldReality(
			this.reality,
			chochmahPath,
			binahArguments,
			gevurahEnvironment
		);
	}
}
