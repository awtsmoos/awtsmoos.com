// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers each visible and hidden interface vessel once;
 * Awtsmoos.com keeps the retract control beside every established campaign hook without multiplying lookups.
 */
export function cacheDom() {
	const byId = id => document.getElementById(id);
	return {
		progress: byId('sparkMeter'),
		mass: byId('massText'),
		time: byId('timeText'),
		rank: byId('rankText'),
		combo: byId('comboText'),
		best: byId('bestText'),
		level: byId('levelText'),
		sefirah: byId('sefText'),
		objective: byId('objectiveText'),
		progressText: byId('progressText'),
		bonus: byId('bonusText'),
		bonusProgress: byId('bonusProgressText'),
		power: byId('powerText'),
		district: byId('districtText'),
		mode: byId('modeText'),
		event: byId('eventText'),
		boss: byId('bossText'),
		rival: byId('rivalText'),
		achievement: byId('achievementText'),
		sparkHud: byId('sparkHudText'),
		message: byId('message'),
		resourceRail: byId('resourceRail'),
		armorText: byId('armorText'),
		perutahText: byId('perutahText'),
		shlichusText: byId('shlichusText'),
		peerText: byId('peerText'),
		pulseButton: byId('pulse'),
		pulseState: byId('pulseState'),
		leaderboard: byId('leaderboard'),
		overlay: byId('overlay'),
		title: byId('overlayTitle'),
		text: byId('overlayText'),
		stars: byId('overlayStars'),
		start: byId('startBtn'),
		restart: byId('restartBtn'),
		pause: byId('pauseBtn'),
		hudToggle: byId('hudToggleBtn'),
		campaignSummary: byId('campaignSummary'),
		campaignSpark: byId('campaignSpark'),
		chapterSelect: byId('chapterSelect'),
		levelSelect: byId('levelSelect'),
		shopGrid: byId('shopGrid'),
		questList: byId('questList'),
		modeSelect: byId('modeSelect'),
		modeCycle: byId('modeCycleBtn'),
		modeDescription: byId('modeDescription'),
		adventureBrief: byId('adventureBrief'),
		talentGrid: byId('talentGrid'),
		roomStatus: byId('roomStatus'),
		roomInput: byId('roomInput'),
		roomButton: byId('roomBtn'),
		haptic: byId('hapticBtn'),
		postfx: byId('postfxBtn'),
		map: byId('map'),
		perf: [...document.querySelectorAll('[data-perf]')]
	};
}
