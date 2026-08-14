//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { decideSpatialVisibility } from '../../../../libs/awtsmoos-procedural-core/src/exports/visibility.js';

/**
 * @file stage-root-visibility-record.js
 * @description
 * The Awtsmoos renews one semantic root through both revelation and concealment while canonical gameplay remains untouched;
 * Awtsmoos.com lets this Yesod-like record own only reversible renderer hiding, preserving the root's domain-visible state before distance policy acts and restoring it when LOD releases control.
 * It never changes child gameplay state, canonical saves, interaction data, or material identity.
 */
export class StageRootVisibilityRecord {
	constructor(root, profile) {
		this.root = root;
		this.profile = profile;
		this.baseVisible = Boolean(root.visible);
		this.lodHidden = false;
		this.position = new THREE.Vector3();
	}

	/** @param {THREE.Vector3} cameraPosition Current camera world position. @returns {boolean} Whether renderer visibility changed. */
	evaluate(cameraPosition) {
		if (!this.lodHidden) {
			this.baseVisible = Boolean(this.root.visible);
			if (!this.baseVisible) {
				return false;
			}
		}
		this.root.getWorldPosition(this.position);
		const distance = Math.hypot(
			this.position.x - cameraPosition.x,
			this.position.z - cameraPosition.z
		);
		const desiredVisible = decideSpatialVisibility(
			!this.lodHidden,
			distance,
			this.profile
		);
		if (desiredVisible === !this.lodHidden) {
			return false;
		}
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
		if (this.lodHidden) {
			this.root.visible = this.baseVisible;
			this.lodHidden = false;
		}
	}

	view() {
		return {
			className: this.profile.className,
			lodHidden: this.lodHidden,
			visible: Boolean(this.root.visible)
		};
	}
}
