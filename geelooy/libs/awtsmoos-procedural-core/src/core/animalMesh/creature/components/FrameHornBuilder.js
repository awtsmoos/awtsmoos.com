// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameHornBuilder.js
 * @description Reveals horns, antlers, and tusks from any resolved anatomical attachment frame.
 * The Awtsmoos is beyond horn and hoof, yet Awtsmoos.com lets one local frame receive countless crowned forms;
 * Chochmah chooses a profile, Gevurah bounds dimensions, and Tiferes bends the centerline without binding it to the head alone.
 */

import { componentLoftGuide } from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';

const HORN_PROFILES = Object.freeze({
	antler: Object.freeze({ length: 1.15, lift: 0.58, sweep: 0.3, width: 0.16, twist: 0.1 }),
	cattle: Object.freeze({ length: 0.92, lift: 0.34, sweep: 0.22, width: 0.15, twist: 0.04 }),
	demonic: Object.freeze({ length: 1.28, lift: 0.66, sweep: -0.18, width: 0.19, twist: 0.16 }),
	swept: Object.freeze({ length: 1.05, lift: 0.42, sweep: 0.48, width: 0.14, twist: 0.12 }),
	default: Object.freeze({ length: 0.9, lift: 0.4, sweep: 0.16, width: 0.13, twist: 0.05 })
});

/** Frame-native specialist for rigid tapered anatomical growths. */
export class FrameHornBuilder extends CreatureComponentBuilder {
	constructor() {
		super(['horn', 'antler', 'tusk']);
	}

	/** Builds one loft guide in the attachment frame, with optional compiler-level bilateral mirroring. */
	build(keterComponent, yesodFrame, malchusContext = {}) {
		const chochmahProfile = profileFor(keterComponent);
		const tiferesId = String(malchusContext.id || keterComponent.id || keterComponent.type);
		const netzachGuideId = keterComponent.mirror ? `left_${tiferesId}` : tiferesId;
		const hodCenterline = hornCenterline(yesodFrame, keterComponent, chochmahProfile);
		const gevurahWidth = chochmahProfile.width * keterComponent.scale[0];
		const yesodGuide = componentLoftGuide(
			hodCenterline,
			[gevurahWidth, gevurahWidth * 0.74, gevurahWidth * 0.38, 0.012],
			malchusContext.quality,
			{ materialId: materialRole(keterComponent), twist: chochmahProfile.twist }
		);
		return Object.freeze({
			guides: Object.freeze({ [netzachGuideId]: enrichGuide(yesodGuide, keterComponent) }),
			surfaceRoles: Object.freeze([materialRole(keterComponent)]),
			symmetryPairs: Object.freeze(keterComponent.mirror
				? [{ left: netzachGuideId, right: `right_${tiferesId}` }]
				: [])
		});
	}
}

function hornCenterline(frame, component, profile) {
	const length = profile.length * component.scale[2];
	const lift = profile.lift * component.scale[1];
	const sweep = profile.sweep * component.scale[0];
	return Object.freeze([
		frame.transformPoint([0, 0, 0]),
		frame.transformPoint([sweep * 0.16, lift * 0.22, length * 0.34]),
		frame.transformPoint([sweep * 0.58, lift * 0.62, length * 0.7]),
		frame.transformPoint([sweep, lift, length])
	].map(point => Object.freeze(point)));
}

function profileFor(component) {
	const id = String(component.profile?.id || component.type || 'default').toLowerCase();
	return HORN_PROFILES[id] || HORN_PROFILES.default;
}

function materialRole(component) {
	return String(component.material?.role || 'horn');
}

function enrichGuide(guide, component) {
	return Object.freeze({
		...guide,
		component_shading: Object.freeze({ smooth: component.shading?.smooth !== false }),
		component_type: component.type
	});
}
