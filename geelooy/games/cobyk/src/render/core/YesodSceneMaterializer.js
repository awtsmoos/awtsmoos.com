//B"H
//Boruch Hashem
//Blessed is He

import { Group } from "./CobyKCoreRuntime.js";
import { MalchusPrimitiveVisualFactory } from "./MalchusPrimitiveVisualFactory.js";

/**
 * @file YesodSceneMaterializer.js
 * @description Owns stable CobyK scene-container identity and delegates replaceable primitive construction/material transitions to a separate Malchus factory.
 * The Awtsmoos renews place before garment and garment before sight, yet no garment becomes the soul;
 * Awtsmoos.com lets this Yesod vessel keep stable finite identity while richer children enter beneath one whole.
 */
export class YesodSceneMaterializer {
	constructor(binaOptions = {}) {
		this.malchusPrimitive = binaOptions.primitiveFactory || new MalchusPrimitiveVisualFactory();
	}

	/**
	 * Creates one stable identity/position container with an immediately visible primitive child.
	 * @param {object} malchusRecord Immutable visual record.
	 * @returns {Group} Stable Core container.
	 */
	reveal(malchusRecord) {
		const yesodContainer = new Group();
		yesodContainer.name = `cobyk:${malchusRecord.id}`;
		yesodContainer.userData.cobykId = malchusRecord.id;
		yesodContainer.userData.cobykKind = malchusRecord.kind;
		yesodContainer.userData.cobykDynamic = malchusRecord.dynamic;
		const malchusVisual = this.malchusPrimitive.reveal(malchusRecord);
		yesodContainer.userData.cobykVisual = malchusVisual;
		yesodContainer.add(malchusVisual);
		return this.update(yesodContainer, malchusRecord);
	}

	/**
	 * Updates derived position/visibility and primitive scale/material while preserving the stable container and shared geometry.
	 * @param {Group} yesodContainer Existing stable scene node.
	 * @param {object} malchusRecord Latest visual record.
	 * @returns {Group} Updated container.
	 */
	update(yesodContainer, malchusRecord) {
		yesodContainer.position.set(
			malchusRecord.position.x,
			malchusRecord.position.y,
			malchusRecord.position.z
		);
		yesodContainer.visible = malchusRecord.visible;
		yesodContainer.userData.cobykRecord = malchusRecord;
		const malchusVisual = yesodContainer.userData.cobykVisual;
		if (malchusVisual?.userData?.cobykPrimitive) {
			this.malchusPrimitive.update(
				malchusVisual,
				malchusRecord
			);
		}
		return yesodContainer;
	}

	/**
	 * Replaces only the visual child beneath a stable container, preserving scene identity and world transforms for async model upgrades.
	 * @param {Group} yesodContainer Stable scene node.
	 * @param {object} chaiVisual New Core visual hierarchy.
	 * @returns {object} Installed visual hierarchy.
	 */
	replaceVisual(yesodContainer, chaiVisual) {
		const malchusOld = yesodContainer.userData.cobykVisual;
		if (malchusOld) yesodContainer.remove(malchusOld);
		yesodContainer.add(chaiVisual);
		yesodContainer.userData.cobykVisual = chaiVisual;
		return chaiVisual;
	}

	/**
	 * Starts nonblocking local/remote texture hydration for one record according to the current adaptive visual budget.
	 * @param {object} malchusRecord Immutable visual record.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {Promise<string>} Hydration result state.
	 */
	hydrate(malchusRecord, tiferesBudget) {
		return this.malchusPrimitive.hydrate(
			malchusRecord,
			tiferesBudget
		);
	}

	/** @returns {object} Frozen shared geometry/material diagnostics. */
	snapshot() {
		return this.malchusPrimitive.snapshot();
	}
}
