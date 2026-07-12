// B"H

/** Cache every desktop, mobile, mode, and director interface vessel once. */
export function cacheDom() {
	const byId = id => document.getElementById(id);
	return {
		progress: byId('sparkMeter'), mass: byId('massText'), time: byId('timeText'), rank: byId('rankText'),
		combo: byId('comboText'), best: byId('bestText'), level: byId('levelText'), sefirah: byId('sefText'),
		objective: byId('objectiveText'), progressText: byId('progressText'), bonus: byId('bonusText'),
		bonusProgress: byId('bonusProgressText'), power: byId('powerText'), district: byId('districtText'),
		mode: byId('modeText'), event: byId('eventText'), boss: byId('bossText'), rival: byId('rivalText'),
		achievement: byId('achievementText'), message: byId('message'), leaderboard: byId('leaderboard'),
		overlay: byId('overlay'), title: byId('overlayTitle'), text: byId('overlayText'), stars: byId('overlayStars'),
		start: byId('startBtn'), restart: byId('restartBtn'), pause: byId('pauseBtn'),
		levelSelect: byId('levelSelect'), modeSelect: byId('modeSelect'), modeCycle: byId('modeCycleBtn'),
		modeDescription: byId('modeDescription'), haptic: byId('hapticBtn'), postfx: byId('postfxBtn'),
		map: byId('map'), perf: [...document.querySelectorAll('[data-perf]')]
	};
}
