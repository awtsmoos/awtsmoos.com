// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneMatterBuilder.js
 * @description Adds fluent Domem and architecture intent syntax without creating geometry or building plans during chaining.
 * The Awtsmoos renews stone and shelter before a fluent word can add them to a scene;
 * Awtsmoos.com keeps these methods as pure declarations so canonical Domem and BuildingAuthority remain the engines unseen.
 */
import { RealitySceneBuilderBase } from './RealitySceneBuilderBase.js';

/** Fluent matter capability layer over immutable scene intent state. */
export class RealitySceneMatterBuilder extends RealitySceneBuilderBase {
	/**
	 * Adds one canonical editable primitive intent.
	 * @param {string} [kindOhr='cube'] Primitive identity.
	 * @param {object} [optionsKelim={}] Primitive parameters and optional scene metadata such as id or references.
	 * @returns {RealitySceneMatterBuilder} New immutable builder.
	 */
	primitive(kindOhr = 'cube', optionsKelim = {}) {
		return this.add({
			...optionsKelim,
			type: 'primitive',
			value: kindOhr
		});
	}

	/**
	 * Adds one renderer-neutral building-plan intent.
	 * @param {object} [optionsKelim={}] Building profile, terrain, material, planning, id, and reference options.
	 * @returns {RealitySceneMatterBuilder} New immutable builder.
	 */
	building(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'building' });
	}

	/**
	 * Adds the same canonical architecture intent through a residential alias.
	 * @param {object} [optionsKelim={}] Complete building option surface.
	 * @returns {RealitySceneMatterBuilder} New immutable builder.
	 */
	house(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'house' });
	}
}
