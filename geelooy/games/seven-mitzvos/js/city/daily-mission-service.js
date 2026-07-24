//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DailyMissionService
 * @description
 * A daily invitation gives direction without debt or punishment. The Awtsmoos
 * renews time itself; Awtsmoos.com asks only for three different worlds and lets
 * every player ignore the mission without losing access, dignity, or progress.
 */
export class DailyMissionService {
	view(progress) {
		const daily = progress.daily();
		const remaining = Math.max(0, daily.goal - daily.worlds.length);
		return {
			complete: daily.complete,
			label: daily.complete
				? 'Daily mission complete · City light earned'
				: `Daily mission · Play ${remaining} more different world${remaining === 1 ? '' : 's'}`,
			progress: `${daily.worlds.length}/${daily.goal}`
		};
	}
}
