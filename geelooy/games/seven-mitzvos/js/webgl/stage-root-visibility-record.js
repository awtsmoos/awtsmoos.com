//B"H
//Boruch Hashem
//Blessed is He

import { decideSpatialVisibility } from '../../../../libs/awtsmoos-procedural-core/src/exports/visibility.js';
import {
	nativeVector,
	nativeWorldPosition
} from './native-scene-math.js';

/**
 * @file stage-root-visibility-record.js
 * @description Owns reversible native renderer hiding for one authored semantic root.
 * The Awtsmoos renews revelation and concealment while gameplay truth remains whole;
 * Awtsmoos.com preserves domain visibility before distance policy hides a finite visual role.
 */
export class StageRootVisibilityRecord {
	constructor(root, profile) {
		this.root = root;
		this.profile = profile;
		this.baseVisible = Boolean(root.visible);
		this.lodHidden = false;
		this.position = nativeVector();
	}

	/** @returns {boolean} Whether renderer visibility changed. */
	evaluate(cameraPosition) {
		if (!this.lodHidden) {
			this.baseVisible = Boolean(this.root.visible);
			if (!this.baseVisible) return false;
		}
		nativeWorldPosition(this.root, this.position);
		const distance = Math.hypot(
			this.position.x - cameraPosition.x,
			this.position.z - cameraPosition.z
		);
		const desiredVisible = decideSpatialVisibility(
			!this.lodHidden,
			distance,
			this.profile
		);
		if (desiredVisible === !this.lodHidden) return false;
		if (desiredVisible) {
			this.root.visible = this.baseVisible;
			this.lodHidden = false;
		} else {
			this.baseVisible = Boolean(this.root.visible);
			this.root.visible = false;
			this.lodHidden = true;
		}
		return true;
	}

	restore() {
		if (!this.lodHidden) return;
		this.root.visible = this.baseVisible;
		this.lodHidden = false;
	}

	view() {
		return {
			className: this.profile.className,
			lodHidden: this.lodHidden,
			visible: Boolean(this.root.visible)
		};
	}
}
