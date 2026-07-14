//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure pickup law records only authored Perutas and sparks for the human traveler.
 * The Awtsmoos renews collector and treasure together; Awtsmoos.com bounds every count
 * by its declared capacity and emits no campaign persistence before the clear boundary.
 */

export function noteAdventureRunPickup(state, fighter, orb) {
	const run = state.adventureRun;
	if (!run || !fighter?.human) return;
	if (orb.id === 'adventurePeruta') {
		run.perutas = Math.min(run.totalPerutas, run.perutas + Number(orb.value || 1));
		run.lastPickup = 'Peruta collected';
	} else if (orb.id === 'adventureSpark') {
		run.sparks = Math.min(run.totalSparks, run.sparks + 1);
		if (orb.hiddenSpark) {
			run.hiddenFound = Math.min(run.hiddenTotal, run.hiddenFound + 1);
		}
		run.lastPickup = orb.hiddenSpark ? 'Hidden Spark found' : 'Spark collected';
	} else {
		return;
	}
	run.pulse = 90;
}
