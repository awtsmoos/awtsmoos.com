//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the generator metrics vessel in this instant, revealing
 * its focused js render ui service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H � Fighter generator panel math. The right side of the vision image
 * is not static decoration: it is a live mirror of the generated player DNA,
 * rendered by Canvas2D as sliders, signature, preview, and a golden radar.
 */
export function generatorMetrics(fighter) {
	const dna = fighter.dna;
	return [
		metric('Height', dna.height, 0.75, 1.35),
		metric('Mass', dna.mass, 0.75, 1.45),
		metric('Arm Length', dna.arm, 0.75, 1.45),
		metric('Leg Length', dna.leg, 0.75, 1.45),
		metric('Power', dna.power, 0.65, 1.65),
		metric('Speed', dna.speed, 0.65, 1.65),
		metric('Recovery', dna.recovery, 0.65, 1.65),
		metric('Shield', fighter.shield / fighter.stats.shield, 0, 1)
	];
}

function metric(label, value, min, max) {
	return { label, value, unit: (value - min) / (max - min) };
}

/**
 * Reveals the signature points behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} cx The cx value entering this behavior.
 * @param {*} cy The cy value entering this behavior.
 * @param {*} radius The radius value entering this behavior.
 */
export function signaturePoints(fighter, cx, cy, radius) {
	const metrics = generatorMetrics(fighter).slice(0, 6);
	return metrics.map((m, i) => {
		const a = -Math.PI / 2 + (i * Math.PI * 2) / metrics.length;
		const r = radius * Math.max(0.08, Math.min(1, m.unit));
		return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: m.label };
	});
}
