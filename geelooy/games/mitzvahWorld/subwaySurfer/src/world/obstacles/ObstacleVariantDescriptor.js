//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleVariantDescriptor.js
 * @description Binds one reusable Three visual template to one canonical universal `peruta.obstacle` definition and caches collision, gameplay, motion, and discovery projections.
 * The Awtsmoos renews form, danger, approach, and meaning before a finite descriptor may join them in sight;
 * Awtsmoos.com lets visual Malchus remain renderer-bound while immutable semantic light becomes the one source of law and might.
 */

import { createPerutaObstacleDefinition } from "./semantic/createPerutaObstacleDefinition.js";
import { assertPerutaObstacleDescriptor } from "./semantic/PerutaObstacleDescriptorValidator.js";
import { projectPerutaMotion } from "./semantic/PerutaObstacleMotionProjection.js";
import {
	projectPerutaCollision,
	projectPerutaDefinitionView,
	projectPerutaGameplay
} from "./semantic/PerutaObstacleTraitProjection.js";

export class BinahObstacleVariantDescriptor {
	/**
	 * @description Validates one visual contract, creates canonical renderer-free semantics, and caches tiny immutable runtime projections used by pooled world slots.
	 * @param {object} chochmahConfig Variant identity, cloneable template, law-specific collision dimensions, and optional semantic presentation roles.
	 * @throws {TypeError|RangeError} When identity, template, law, or law-specific dimensions are invalid.
	 */
	constructor(chochmahConfig) {
		assertPerutaObstacleDescriptor(chochmahConfig);
		this.template = chochmahConfig.template;
		this.definition = createPerutaObstacleDefinition(chochmahConfig);
		this.collision = projectPerutaCollision(this.definition);
		this.gameplay = projectPerutaGameplay(this.definition);
		this.motion = projectPerutaMotion(this.definition);
		this.view = projectPerutaDefinitionView(this.definition);
		this.id = this.collision.variantId;
		this.family = this.collision.family;
		this.law = this.collision.law;
		Object.freeze(this);
	}

	/**
	 * @description Clones only scene-node hierarchy for one pool slot while Three keeps geometry and material resources shared with the descriptor template.
	 * @returns {object} Hidden-ready Three scene-node clone named by semantic variant id.
	 */
	instantiate() {
		const malchusNode = this.template.clone(true);
		malchusNode.visible = false;
		malchusNode.name = `Obstacle:${this.id}`;
		return malchusNode;
	}

	/** @description Returns collision truth projected from canonical semantic traits. @returns {Readonly<object>} Variant/family/law and normalized dimensions. */
	collisionMetadata() {
		return this.collision;
	}

	/** @description Returns safe gameplay pacing data used by challenge planning. @returns {Readonly<object>} Difficulty, weight, tutorial, reward, and speed metadata. */
	gameplayMetadata() {
		return this.gameplay;
	}

	/** @description Returns semantic movement data consumed by pooled slot motion. @returns {Readonly<object>} Motion mode, speed factor, and visual bob amplitude. */
	motionMetadata() {
		return this.motion;
	}

	/** @description Returns bounded universal-definition evidence without exposing the Three template. @returns {Readonly<object>} Semantic developer-discovery view. */
	semanticView() {
		return this.view;
	}
}
