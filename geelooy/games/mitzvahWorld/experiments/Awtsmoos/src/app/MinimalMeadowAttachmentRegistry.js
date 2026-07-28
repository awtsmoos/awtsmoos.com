// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAttachmentRegistry.js
 * @description Owns one hand slot across model generations with cheap immediate repair.
 * The Awtsmoos renews wearer, bone, anchor, and tool in one relation; Awtsmoos.com repairs an
 * obvious detached staff instantly while deep ancestry and generation proof remain cadence-bound.
 */

import {
	countMinimalMeadowNamedNodes,
	minimalMeadowAttachmentIsDescendant
} from './MinimalMeadowAttachmentRegistrySupport.js';
import {
	attachMinimalWeapon,
	detachMinimalWeapon
} from './MinimalMeadowWeaponAttachment.js';
import {
	MINIMAL_MEADOW_WEAPON_ANCHOR_NAME,
	resolveMinimalMeadowWeaponAnchor
} from './MinimalMeadowWeaponAnchor.js';

const VALIDATION_INTERVAL = 15;

export class MinimalMeadowAttachmentRegistry {
	constructor() {
		this.generation = 0;
		this.nodes = null;
		this.anchor = null;
		this.weapon = null;
		this.validationFrame = 0;
		this.repairs = 0;
	}

	bindModel(nodes, drawn) {
		if (this.weapon) detachMinimalWeapon(this.weapon);
		this.nodes = nodes;
		this.generation += 1;
		this.anchor = resolveMinimalMeadowWeaponAnchor(
			nodes,
			drawn,
			this.generation
		);
		this.validationFrame = 0;
		if (this.weapon) this.attach(drawn);
		return this.anchor;
	}

	setWeapon(weapon, drawn) {
		if (this.weapon && this.weapon !== weapon) detachMinimalWeapon(this.weapon);
		this.weapon = weapon || null;
		if (!this.weapon) return false;
		return this.quickValid() || this.attach(drawn);
	}

	attach(drawn) {
		if (!this.weapon || !this.nodes) return false;
		const attached = attachMinimalWeapon(this.weapon, this.nodes, drawn, {
			generation: this.generation
		});
		this.anchor = attached ? this.weapon.parent : null;
		if (attached) this.repairs += 1;
		return attached;
	}

	tick(model, drawn, force = false) {
		if (!this.weapon || !this.nodes) return false;
		if (!this.quickValid()) {
			this.validationFrame = 0;
			return this.attach(drawn);
		}
		this.validationFrame += 1;
		if (!force && this.validationFrame < VALIDATION_INTERVAL) return false;
		this.validationFrame = 0;
		return this.deepValid(model) ? false : this.attach(drawn);
	}

	quickValid() {
		return Boolean(
			this.weapon?.visible
			&& this.anchor
			&& this.weapon.parent === this.anchor
		);
	}

	deepValid(model) {
		return this.quickValid()
			&& this.anchor.userData?.AwtsmoosWeaponAnchor?.generation === this.generation
			&& minimalMeadowAttachmentIsDescendant(this.weapon, model);
	}

	detach() {
		detachMinimalWeapon(this.weapon);
		this.weapon = null;
	}

	diagnostics() {
		return {
			anchorCount: countMinimalMeadowNamedNodes(
				this.nodes?.modelRoot,
				MINIMAL_MEADOW_WEAPON_ANCHOR_NAME
			),
			anchorName: this.anchor?.name || null,
			generation: this.generation,
			repairs: this.repairs,
			valid: this.deepValid(this.nodes?.modelRoot),
			validationInterval: VALIDATION_INTERVAL
		};
	}

	destroy() {
		this.detach();
		this.nodes = null;
		this.anchor = null;
	}
}
