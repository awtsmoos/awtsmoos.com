//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign and endless traces become honest measures rather than hidden save fields.
 * The Awtsmoos is beyond record while Awtsmoos.com reveals each finite memory.
 */
export class RecordController {
	constructor(systems, hud) {
		this.systems = systems;
		this.hud = hud;
	}

	show() {
		const save = this.systems.save;
		const records = save.records;
		const endless = save.modeRecords.endless;
		const latest = save.runHistory[0];
		this.hud.choice.show({
			title: 'BEST RECORDS',
			subtitle: `${save.relics.length} RELICS · ${save.runHistory.length} RECENT RUNS`,
			choices: [
				record('Best Distance', records.bestDistance),
				record('Greatest Formation', records.bestTroops),
				record('Highest Combo', records.highestCombo),
				record('Bosses Defeated', records.bossesDefeated),
				record('Campaign Victories', records.victories),
				record('Endless Best Cycle', endless.bestCycle),
				record('Endless Best Distance', endless.bestDistance),
				record('Endless Best Score', endless.bestScore),
				latestRecord(latest)
			],
			onChoose: () => {},
			onClose: () => this.hud.choice.hide()
		});
	}
}

function record(name, value) {
	return {
		id: name,
		name,
		description: Number(value || 0).toLocaleString(),
		disabled: true
	};
}

function latestRecord(entry) {
	if (!entry) {
		return record('Latest Run', 0);
	}
	const mode = entry.mode === 'endless' ?
		`ENDLESS CYCLE ${entry.cycle}` : 'CAMPAIGN';
	return {
		id: 'latest-run',
		name: 'Latest Run',
		description: `${mode} · ${entry.result.toUpperCase()} · SCORE ${entry.score.toLocaleString()}`,
		disabled: true
	};
}
