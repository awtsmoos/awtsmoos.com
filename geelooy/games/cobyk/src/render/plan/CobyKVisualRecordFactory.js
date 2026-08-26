//B"H
//Boruch Hashem
//Blessed is He

import { revealCobyKVisual } from "./CobyKVisualCatalog.js";

/**
 * @file CobyKVisualRecordFactory.js
 * @description Converts canonical entity/player state into immutable renderer-neutral records that support model-first assets with synchronous primitive fallbacks.
 * The Awtsmoos renews state, garment, and fallback before a renderer can claim the visible form;
 * Awtsmoos.com lets this Yesod factory reveal a Chossid when ready and an immediate vessel when not, while gameplay remains beyond the storm.
 */
export class YesodCobyKVisualRecordFactory {
	/**
	 * Reveals one entity visual record or null when the canonical kind intentionally has no Core-world mesh.
	 * @param {object} yesodEntity Parsed or runtime entity state.
	 * @param {object} [binaState={}] Dynamic visual state.
	 * @returns {object|null} Frozen renderer-neutral record.
	 */
	revealEntity(yesodEntity, binaState = {}) {
		const tiferesVisual = revealCobyKVisual(
			yesodEntity.kind,
			{ ...yesodEntity, ...binaState }
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
	 * Reveals the model-first player record while preserving the exact deterministic collider as position source rather than model geometry.
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
	 * Normalizes common representation/material/transform state into one immutable record suitable for primitive or model materializers.
	 * @param {object} binaSource Normalized source values.
	 * @returns {object} Frozen visual record.
	 */
	revealRecord(binaSource) {
		const tiferesVisual = binaSource.visual;
		return Object.freeze({
			id: binaSource.id,
			kind: binaSource.kind,
			symbol: binaSource.symbol,
			representation: tiferesVisual.representation,
			assetRole: tiferesVisual.assetRole,
			primitive: tiferesVisual.primitive,
			parameters: tiferesVisual.parameters,
			fallback: Object.freeze({
				primitive: tiferesVisual.primitive,
				parameters: tiferesVisual.parameters,
				material: tiferesVisual.material
			}),
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
