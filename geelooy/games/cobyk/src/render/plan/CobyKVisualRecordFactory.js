//B"H
//Boruch Hashem
//Blessed is He

import { revealCobyKVisual } from "./CobyKVisualCatalog.js";

/**
 * @file CobyKVisualRecordFactory.js
 * @description Converts canonical entity/player runtime state into immutable renderer-neutral records with stable ids, transforms, material roles, and animation semantics.
 * The Awtsmoos renews state and garment before a record can claim the visible form;
 * Awtsmoos.com lets this Yesod factory bind finite transforms to canonical meaning while the renderer remains free to reveal the storm.
 */
export class YesodCobyKVisualRecordFactory {
	/**
	 * Reveals one entity visual record or null when the kind is intentionally non-renderable.
	 * @param {object} yesodEntity Canonical parsed or runtime entity state.
	 * @param {object} [binaState={}] Dynamic visual state such as finisher unlock or scale.
	 * @returns {object|null} Frozen renderer-neutral record.
	 */
	revealEntity(yesodEntity, binaState = {}) {
		const tiferesVisual = revealCobyKVisual(
			yesodEntity.kind,
			{
				...yesodEntity,
				...binaState
			}
		);
		if (!tiferesVisual) return null;
		const tiferesScale = Number(binaState.scale) || 1;
		return this.revealRecord({
			id: yesodEntity.id,
			kind: yesodEntity.kind,
			symbol: yesodEntity.symbol || "",
			x: yesodEntity.x + (yesodEntity.width || 1) / 2,
			y: yesodEntity.y + (yesodEntity.height || 1) / 2,
			width: (yesodEntity.width || 1) * tiferesScale,
			height: (yesodEntity.height || 1) * tiferesScale,
			visible: binaState.visible ?? yesodEntity.visible ?? true,
			dynamic: Boolean(yesodEntity.kinetic) || ["coin", "finisher"].includes(yesodEntity.kind),
			visual: tiferesVisual
		});
	}

	/**
	 * Reveals the traveler's visual record from the deterministic player snapshot without changing collider dimensions.
	 * @param {object} malchusPlayer Immutable player snapshot.
	 * @returns {object} Frozen player visual record.
	 */
	revealPlayer(malchusPlayer) {
		return this.revealRecord({
			id: "player",
			kind: "player",
			symbol: "p",
			x: malchusPlayer.x + malchusPlayer.width / 2,
			y: malchusPlayer.y + malchusPlayer.height / 2,
			width: malchusPlayer.width,
			height: malchusPlayer.height,
			visible: true,
			dynamic: true,
			visual: revealCobyKVisual("player", malchusPlayer),
			velocity: Object.freeze({
				x: malchusPlayer.vx,
				y: malchusPlayer.vy
			})
		});
	}

	/**
	 * Normalizes shared primitive/material/transform state into one immutable scene-plan record.
	 * @param {object} binaSource Normalized source values.
	 * @returns {object} Frozen visual record.
	 */
	revealRecord(binaSource) {
		const tiferesVisual = binaSource.visual;
		return Object.freeze({
			id: binaSource.id,
			kind: binaSource.kind,
			symbol: binaSource.symbol,
			primitive: tiferesVisual.primitive,
			parameters: tiferesVisual.parameters,
			material: tiferesVisual.material,
			animation: tiferesVisual.animation,
			priority: tiferesVisual.priority,
			position: Object.freeze({ x: binaSource.x, y: binaSource.y, z: tiferesVisual.depth }),
			scale: Object.freeze({ x: binaSource.width, y: binaSource.height, z: 0.72 }),
			rotation: Object.freeze({ x: 0, y: 0, z: 0 }),
			visible: Boolean(binaSource.visible),
			dynamic: Boolean(binaSource.dynamic),
			velocity: binaSource.velocity || null
		});
	}
}
