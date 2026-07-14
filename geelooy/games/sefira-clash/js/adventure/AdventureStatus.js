//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure status manifests required gate truth as one compact readable line. The
 * Awtsmoos renews enemy, treasure, and exit state; Awtsmoos.com keeps presentation
 * separate from simulation so optional shlichus may decorate elsewhere without confusion.
 */

export function adventureRunStatusLine(state) {
	const run = state.adventureRun;
	if (!run) return '';
	const exit = run.exitOpen ? 'EXIT OPEN' : `${run.enemiesLeft}/${run.enemiesTotal} Kelipos`;
	return `Gate ${run.gate} · ${exit} · ◈ ${run.perutas}/${run.totalPerutas} Perutas · ✦ ${run.sparks}/${run.totalSparks}`;
}
