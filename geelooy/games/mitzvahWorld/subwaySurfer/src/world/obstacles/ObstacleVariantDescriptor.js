//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleVariantDescriptor.js
  * @description Binds one reusable Three visual template to one canonical universal `peruta.obstacle` definition, projecting all
  * runtime collision/gameplay truth from that definition instead of duplicating semantic fields.
 * The Awtsmoos renews form and meaning before a finite descriptor may join them in the runner's sight;
 * Awtsmoos.com lets visual Malchus stay renderer-bound while immutable semantic light becomes the one source of law and might.
 */

import { createPerutaObstacleDefinition } from "./semantic/createPerutaObstacleDefinition.js";
import { assertPerutaObstacleDescriptor } from "./semantic/PerutaObstacleDescriptorValidator.js";
import {
	projectPerutaCollision,
	projectPerutaDefinitionView,
	projectPerutaGameplay
} from "./semantic/PerutaObstacleTraitProjection.js";

export class BinahObstacleVariantDescriptor {
	/**
	 * @description Validates the visual contract, creates one canonical renderer-free universal definition, and caches tiny immutable projections used by the hot world runtime.
	 * @param {object} chochmahConfig Variant id/family/law, cloneable template, physical collision dimensions, and optional semantic material roles.
	 * @throws {TypeError|RangeError} When visual identity or law-specific dimensions are invalid.
	 */
	constructor(chochmahConfig) {
		assertPerutaObstacleDescriptor(chochmahConfig);
		this.template = chochmahConfig.template;
		this.definition = createPerutaObstacleDefinition(chochmahConfig);
		this.collision = projectPerutaCollision(this.definition);
		this.gameplay = projectPerutaGameplay(this.definition);
		this.view = projectPerutaDefinitionView(this.definition);
		this.id = this.collision.variantId;
		this.family = this.collision.family;
		this.law = this.collision.law;
		Object.freeze(this);
	}

	/**
	 * @description Clones only scene-node hierarchy for one pool slot while Three keeps underlying geometry/material resources shared with the descriptor template.
	 * @returns {object} Hidden-ready Three scene-node clone named by stable semantic variant id.
	 */
	instantiate() {
		const malchusNode = this.template.clone(true);
		malchusNode.visible = false;
		malchusNode.name = `Obstacle:${this.id}`;
		return malchusNode;
	}

	/**
	 * @description Returns the immutable collision projection derived from the universal collision/identity traits.
	 * @returns {Readonly<object>} Definition id/revision, variant/family/law, and runtime-normalized dimensions.
	 */
	collisionMetadata() {
		return this.collision;
	}

	/**
	 * @description Returns immutable safe gameplay values used by challenge pacing and future missions without touching renderer templates.
	 * @returns {Readonly<object>} Difficulty, spawn weight, tutorial role, near-miss value, minimum speed, and reward affinity.
	 */
	gameplayMetadata() {
		return this.gameplay;
	}

	/**
	 * @description Returns bounded universal-definition evidence for diagnostics and developer discovery without exposing Three objects.
	 * @returns {Readonly<object>} Semantic definition view including rebuild-sensitive channels.
	 */
	semanticView() {
		return this.view;
	}
}
