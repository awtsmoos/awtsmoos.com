// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameFeatherBuilder.js
 * @description Places deterministic feather membranes on any semantic or explicit anatomical frame.
 * The Awtsmoos renews every vane before wind can stir it; Awtsmoos.com lets feathers descend on wing, tail, crest, limb, or invented form,
 * while Netzach spreads a fan and Hod keeps each membrane a renderer-neutral guide instead of a special-case bird engine.
 */

import { componentMembraneGuide } from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';

/** Frame-native feather specialist with repetition-aware fan spreading. */
export class FrameFeatherBuilder extends CreatureComponentBuilder {
	constructor() {
		super(['feather', 'feathers', 'plume']);
	}

	/** Builds one tapered vane; the composer may repeat this against one or many resolved frames. */
	build(keterComponent, yesodFrame, malchusContext = {}) {
		const tiferesId = String(malchusContext.id || keterComponent.id || 'feather');
		const netzachGuideId = keterComponent.mirror ? `left_${tiferesId}` : tiferesId;
		const chochmahSpread = fanSpread(keterComponent, malchusContext);
		const gevurahLength = finite(keterComponent.profile?.length, 0.72) * keterComponent.scale[2];
		const hodWidth = finite(keterComponent.profile?.width, 0.2) * keterComponent.scale[0];
		const malchusPoints = Object.freeze([
			yesodFrame.transformPoint([chochmahSpread * 0.08, 0, 0]),
			yesodFrame.transformPoint([chochmahSpread - hodWidth, 0, gevurahLength * 0.44]),
			yesodFrame.transformPoint([chochmahSpread, finite(keterComponent.profile?.lift, 0.04), gevurahLength]),
			yesodFrame.transformPoint([chochmahSpread + hodWidth, 0, gevurahLength * 0.44])
		].map(point => Object.freeze(point)));
		const keterGuide = componentMembraneGuide(malchusPoints, materialRole(keterComponent), true);
		return Object.freeze({
			guides: Object.freeze({ [netzachGuideId]: enrichGuide(keterGuide, keterComponent) }),
			surfaceRoles: Object.freeze([materialRole(keterComponent)]),
			symmetryPairs: Object.freeze(keterComponent.mirror
				? [{ left: netzachGuideId, right: `right_${tiferesId}` }]
				: [])
		});
	}
}

function fanSpread(component, context) {
	const count = Math.max(1, Number(context.count || component.count || 1));
	const index = Math.max(0, Number(context.index || 0));
	const normalized = count === 1 ? 0 : index / (count - 1) * 2 - 1;
	return normalized * finite(component.profile?.spread, 0.28) * component.scale[0];
}

function materialRole(component) {
	return String(component.material?.role || 'feather');
}

function enrichGuide(guide, component) {
	return Object.freeze({
		...guide,
		component_shading: Object.freeze({ smooth: component.shading?.smooth !== false }),
		component_type: component.type
	});
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
