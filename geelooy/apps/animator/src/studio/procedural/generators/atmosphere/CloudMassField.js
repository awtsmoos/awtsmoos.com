// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CloudMassField.js
 * @description
 * The Awtsmoos renews vapor as layered mass before circles can pretend they alone make a cloud;
 * Awtsmoos.com lets depth, drift, density, and shared light organize lobes into atmosphere instead of a row of bubbles proud.
 */
export class CloudMassField {
	/**
	 * Builds back and front lobe masses from separate structural and cluster streams.
	 * @param {object} streams Semantic seed streams.
	 * @param {object} params Historic cloud parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two cloud traits.
	 * @returns {object[]} Layered renderer-supported ellipses.
	 */
	static create(streams, params, realism, traits) {
		const keterDepth = Math.max(.2, Math.min(1, Number(traits.depth) || .7));
		const yesodDensity = Math.max(.2, Math.min(1, Number(traits.density) || .7));
		const malchusDrift = Math.max(-1, Math.min(1, Number(traits.drift) || 0));
		const chochmahCount = Math.max(3, Math.round(params.lobeCount * (.72 + yesodDensity * .5)));
		return [
			...this.layer(
				streams.structure,
				chochmahCount,
				params,
				malchusDrift,
				keterDepth,
				.72,
				`rgba(211, 222, 232, ${(params.opacity * .68).toFixed(3)})`
			),
			...this.layer(
				streams.cluster,
				params.lobeCount,
				params,
				malchusDrift,
				keterDepth,
				1,
				`rgba(245, 248, 250, ${params.opacity.toFixed(3)})`
			)
		];
	}

	/** @returns {object[]} One correlated cloud depth layer. */
	static layer(random, count, params, drift, depth, scale, fill) {
		return Array.from({ length: count }, (_, hodIndex) => {
			const yesodProgress = count <= 1 ? .5 : hodIndex / (count - 1);
			const malchusX = -params.width * .42
				+ yesodProgress * params.width * .84
				+ drift * params.width * (.035 + depth * .025)
				+ random.range(-params.width * .045, params.width * .045);
			const binahArch = Math.sin(yesodProgress * Math.PI);
			return {
				type: 'ellipse',
				x: malchusX,
				y: -params.height * (.02 + binahArch * (.12 + depth * .08))
					+ random.range(-params.height * .05, params.height * .05),
				radiusX: params.width / Math.max(4, count)
					* random.range(1.05, 1.55)
					* scale
					* params.softness,
				radiusY: params.height * random.range(.22, .42)
					* scale
					* params.softness,
				fill,
				stroke: null
			};
		});
	}
}
