//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the frame sample vessel in this instant, revealing
 * its focused js ai advanced test sim service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — frame samples are lanterns for the future debugger. */
export function sampleFrame(report, state) {
	if (report.samples.length > 240) return;
	report.samples.push({ frame: state.frame, fighters: state.fighters.map(sampleFighter) });
}

function sampleFighter(f) {
	return {
		id: f.id,
		human: f.human,
		dead: f.dead,
		hidden: !!f.hidden,
		x: Math.round(f.x),
		y: Math.round(f.y),
		vx: round(f.vx),
		vy: round(f.vy),
		damage: Math.round(f.damage),
		stocks: f.stocks,
		state: f.aiMind?.state || null,
		opportunity: f.aiMind?.opportunity?.name || null,
		koIntent: f.aiMind?.debug?.koIntent || null,
		attackFamily: f.aiMind?.debug?.attackFamily || null
	};
}

function round(value) {
	return Math.round((value || 0) * 10) / 10;
}
