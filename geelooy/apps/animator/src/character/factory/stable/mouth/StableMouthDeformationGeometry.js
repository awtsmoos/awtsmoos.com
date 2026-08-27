// B"H
// Boruch Hashem
// Blessed is He

/**
 * Expression and speech deform neutral mouth identity through one bounded grammar.
 * The Awtsmoos renews every vowel and feeling; Awtsmoos.com keeps articulation,
 * perspective, identity, persistence, preview, and export mathematically aligned.
 */
export class StableMouthDeformationGeometry {
	static articulation(input = {}, style = {}) {
		return {
			...input,
			open: Number(input.open || 0) * Number(style.openScale || 1),
			jaw: Number(input.jaw || 0) * Number(style.jawScale || 1),
			teeth: Number(input.teeth || 0),
			tongue: Number(input.tongue || 0),
			tongueTip: Number(input.tongueTip || 0),
			cornerLift: Number(input.cornerLift || 0),
			upperLift: Number(input.upperLift || 0)
				* Number(style.upperLiftScale || 1),
			lowerDrop: Number(input.lowerDrop || 0)
				* Number(style.lowerDropScale || 1),
			asymmetry: Number(input.asymmetry || 0),
			press: Number(input.press || 0),
			round: Number(input.round || 0),
			width: Number(input.width ?? 0.5),
			bite: Number(input.bite || 0)
		};
	}

	static perspective(view = {}) {
		if (view.type === 'side') {
			return {
				scaleX: 0.58,
				scaleY: 0.9,
				offsetX: Number(view.dir || 1) * 1.8
			};
		}
		if (view.type === 'threeQuarter') {
			return {
				scaleX: 0.84,
				scaleY: 1,
				offsetX: Number(view.dir || 1) * 0.8
			};
		}
		return { scaleX: 1, scaleY: 1, offsetX: 0 };
	}

	static outerWidth(articulation, style, perspective) {
		const restWidth = Number(style.restWidthScale || style.widthScale || 1);
		return Math.max(
			4,
			(7.5 + articulation.width * 7.5)
				* (1 - articulation.round * 0.2)
				* restWidth
				* perspective.scaleX
		);
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value) || 0));
	}
}
