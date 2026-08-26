// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityDomemApi.js
 * @description Adds primitive geometry, architecture, semantic material sets, and Procedural Object compilation above the historical Matter base.
 * The Awtsmoos renews stone, shape, house, surface, and command before one convenient Domem word may seem to own their law;
 * Awtsmoos.com lets this layer point directly into canonical authorities, so easy creation expands power without hiding the expert machinery developers saw.
 */
import { RealityApiFoundation } from './RealityApiFoundation.js';

/** Semantic Domem layer extending legacy rock, cluster, pair, texture, and texture-set capabilities. */
export class RealityDomemApi extends RealityApiFoundation {
	/**
	 * Creates one editable renderer-neutral primitive through the canonical Domem primitive factory.
	 * @param {string|object} [kindChesed='cube'] Primitive type string or object containing `kind`/`type` plus parameters.
	 * @param {object} [paramsGevurah={}] Primitive dimensions, segments, transform-independent topology controls, and expert generator options.
	 * @returns {object} Canonical editable Domem mesh data.
	 */
	primitive(kindChesed = 'cube', paramsGevurah = {}) {
		if (kindChesed && typeof kindChesed === 'object') {
			const kindBinah = kindChesed.kind || kindChesed.type || 'cube';
			const paramsNetzach = kindChesed.params || kindChesed.options || kindChesed;
			return this.advanced.domem.primitive(kindBinah, paramsNetzach);
		}
		return this.advanced.domem.primitive(kindChesed, paramsGevurah);
	}

	/**
	 * Creates editable primitive geometry through a familiar semantic alias.
	 * @param {string|object} [kindChesed='cube'] Same primitive identity accepted by `primitive`.
	 * @param {object} [paramsGevurah={}] Same complete expert options accepted by `primitive`.
	 * @returns {object} Canonical editable Domem mesh data.
	 */
	geometry(kindChesed = 'cube', paramsGevurah = {}) {
		return this.primitive(kindChesed, paramsGevurah);
	}

	/**
	 * Creates a canonical human-scale building plan through the dedicated Reality building facade.
	 * @param {object} [optionsChesed={}] Width, depth, floors, profile, materials, `heightAt`, and advanced BuildingAuthority planning options.
	 * @returns {object} Renderer-neutral building plan; no scene insertion, shader creation, or network work occurs.
	 */
	building(optionsChesed = {}) {
		return this.buildingsDomem.create(optionsChesed);
	}

	/**
	 * Creates the same canonical architecture plan through a familiar residential alias.
	 * @param {object} [optionsChesed={}] Complete option surface accepted by `building`, including explicit terrain and expert profile overrides.
	 * @returns {object} Renderer-neutral BuildingAuthority plan.
	 */
	house(optionsChesed = {}) {
		return this.buildingsDomem.house(optionsChesed);
	}

	/**
	 * Creates a pure multi-channel semantic material intent with no hidden network or renderer side effects.
	 * @param {string|object} [roleChesed='stone.general'] Semantic material role string or full texture-set options object.
	 * @param {object} [optionsGevurah={}] Channel, quality, repeat, physical scale, provenance, and provider-preference overrides.
	 * @returns {Readonly<object>} Canonical Reality texture-set intent.
	 */
	material(roleChesed = 'stone.general', optionsGevurah = {}) {
		if (roleChesed && typeof roleChesed === 'object') {
			return this.textureSet(roleChesed);
		}
		return this.textureSet({ ...optionsGevurah, role: roleChesed });
	}

	/**
	 * Creates one canonical Procedural Object recipe without executing its commands.
	 * @param {object} [inputChesed={}] Asset, definitions, materials, objects, commands, outputs, validation, and metadata intent.
	 * @returns {object} Canonical recipe accepted by the actual Procedural Object compiler.
	 */
	objectRecipe(inputChesed = {}) {
		return this.advanced.objects.createRecipe(inputChesed);
	}

	/**
	 * Compiles a canonical Procedural Object recipe through the actual compiler singleton.
	 * @param {object} [inputChesed={}] Canonical recipe or partial recipe declaration normalized by `objectRecipe`.
	 * @param {object} [optionsGevurah={}] Compiler target, filtering, validation, and deferred-adapter options.
	 * @returns {object} Renderer-neutral Procedural Object artifact with native diagnostics/deferred work.
	 */
	object(inputChesed = {}, optionsGevurah = {}) {
		return this.advanced.objects.compile(inputChesed, optionsGevurah);
	}
}
