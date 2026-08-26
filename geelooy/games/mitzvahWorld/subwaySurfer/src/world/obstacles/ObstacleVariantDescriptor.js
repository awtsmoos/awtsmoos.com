//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleVariantDescriptor.js
 * @description Validates one themed visual template together with its renderer-neutral collision covenant.
 * The Awtsmoos renews form and boundary before Gevurah may call one encounter safe or denied;
 * Awtsmoos.com lets each visible identity carry truthful dimensions so collision never guesses from the outside.
 */

import {
	PERUTA_OBSTACLE_FAMILIES,
	PERUTA_OBSTACLE_LAWS
} from "../../game/ObstacleVocabulary.js";

export class BinahObstacleVariantDescriptor {
	/**
	 * Creates one immutable obstacle identity around a reusable Three template.
	 * @param {object} chochmahConfig Variant id, family, law, template, and collision dimensions.
	 * @throws {TypeError|RangeError} When the visual/collision covenant is incomplete or invalid.
	 */
	constructor(chochmahConfig) {
		validateIdentity(chochmahConfig);
		this.id = chochmahConfig.id;
		this.family = chochmahConfig.family;
		this.law = chochmahConfig.law;
		this.template = chochmahConfig.template;
		this.metadata = createCollisionMetadata(chochmahConfig);
		Object.freeze(this);
	}

	/**
	 * Creates one scene-node instance while sharing template geometry and materials.
	 * @returns {object} Deep scene-node clone whose Mesh geometry/material references remain shared by Three.
	 */
	instantiate() {
		const malchusNode = this.template.clone(true);
		malchusNode.visible = false;
		malchusNode.name = `Obstacle:${this.id}`;
		return malchusNode;
	}

	/**
	 * Returns immutable collision metadata consumed by WorldChunk and CollisionSystem.
	 * @returns {Readonly<object>} Variant id, family, law, and dimensions.
	 */
	collisionMetadata() {
		return this.metadata;
	}
}

/** @private */
function validateIdentity(config) {
	if (!config || typeof config !== "object") {
		throw new TypeError("Obstacle descriptor config must be an object");
	}
	if (!String(config.id || "")) {
		throw new TypeError("Obstacle descriptor id is required");
	}
	if (!PERUTA_OBSTACLE_FAMILIES.includes(config.family)) {
		throw new RangeError(`Unknown obstacle family: ${config.family}`);
	}
	if (!PERUTA_OBSTACLE_LAWS.includes(config.law)) {
		throw new RangeError(`Unknown obstacle law: ${config.law}`);
	}
	if (!config.template?.clone) {
		throw new TypeError(`Obstacle ${config.id} requires a cloneable visual template`);
	}
	assertPositive(config.collisionDepth, `${config.id} collisionDepth`);
	if (config.law === "jump") assertPositive(config.collisionHeight, `${config.id} collisionHeight`);
	if (config.law === "duck") assertPositive(config.clearanceY, `${config.id} clearanceY`);
}

/** @private */
function createCollisionMetadata(config) {
	return Object.freeze({
		variantId: config.id,
		family: config.family,
		law: config.law,
		collisionDepth: config.collisionDepth,
		collisionHeight: config.law === "jump" ? config.collisionHeight : Number.POSITIVE_INFINITY,
		clearanceY: config.law === "duck" ? config.clearanceY : 0
	});
}

/** @private */
function assertPositive(value, label) {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError(`${label} must be a positive finite number`);
	}
}
