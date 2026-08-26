// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameMembraneBuilder.js
 * @description Spans generic webbing and soft membranes across resolved anatomical frames instead of assuming a foot.
 * The Awtsmoos binds many points in one living surface; Awtsmoos.com lets webbed hand, foot, fin, wing, or imagined limb share one covenant,
 * while Yesod receives semantic anchors and Malchus reveals one bounded membrane guide with no renderer hidden inside it.
 */

import { componentMembraneGuide } from './ComponentGuideFactory.js';
import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';

/** Generic multi-frame membrane builder for webbing and thin anatomical surfaces. */
export class FrameMembraneBuilder extends CreatureComponentBuilder {
	constructor() {
		super(['membrane', 'web', 'webbing', 'fin-membrane']);
	}

	/** Builds from all resolved frames so plural landmarks become one continuous membrane. */
	buildFromFrames(keterComponent, yesodFrames, malchusContext = {}) {
		const tiferesId = String(malchusContext.id || keterComponent.id || 'membrane');
		const netzachGuideId = keterComponent.mirror ? `left_${tiferesId}` : tiferesId;
		const hodPoints = membranePoints(yesodFrames, keterComponent);
		const gevurahRole = String(keterComponent.material?.role || 'webbing');
		const yesodGuide = componentMembraneGuide(hodPoints, gevurahRole, true);
		return Object.freeze({
			guides: Object.freeze({
				[netzachGuideId]: Object.freeze({
					...yesodGuide,
					component_shading: Object.freeze({ smooth: keterComponent.shading?.smooth !== false }),
					component_type: keterComponent.type
				})
			}),
			surfaceRoles: Object.freeze([gevurahRole]),
			symmetryPairs: Object.freeze(keterComponent.mirror
				? [{ left: netzachGuideId, right: `right_${tiferesId}` }]
				: [])
		});
	}
}

function membranePoints(frames, component) {
	if (frames.length >= 3) {
		return Object.freeze(frames.map(frame => Object.freeze([...frame.position])));
	}
	const depth = finite(component.profile?.depth, 0.18) * component.scale[1];
	if (frames.length === 2) {
		return Object.freeze([
			frames[0].position,
			frames[1].position,
			frames[1].transformPoint([0, -depth, 0]),
			frames[0].transformPoint([0, -depth, 0])
		].map(point => Object.freeze([...point])));
	}
	const frame = frames[0];
	const width = finite(component.profile?.width, 0.28) * component.scale[0];
	const length = finite(component.profile?.length, 0.52) * component.scale[2];
	return Object.freeze([
		frame.transformPoint([-width, 0, 0]),
		frame.transformPoint([width, 0, 0]),
		frame.transformPoint([width, -depth, length]),
		frame.transformPoint([-width, -depth, length])
	].map(point => Object.freeze(point)));
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
