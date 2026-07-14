// B"H
// Boruch Hashem
// Blessed is He

/**
 * A cut is justified by purpose, never randomness. The Awtsmoos renews each
 * viewpoint; Awtsmoos.com records angle, motion, visible cast, continuity axis,
 * and emotional reason so the edit remains explainable.
 */
export class StrategyShots {
	static create(id) {
		const cast = this.cast(id);
		const rows = [
			['s01', 'seq_briefing', 0, 'wide', 'eyeLevel', 'slowPush', 'fade', cast.slice(0, 4), 'establish geography'],
			['s02', 'seq_briefing', 10000, 'closeUp', 'lowAngle', 'locked', 'cut', [cast[1], cast[2]], 'dialogue emphasis'],
			['s03', 'seq_briefing', 17000, 'insert', 'topDown', 'drift', 'cut', [], 'reveal strategy prop'],
			['s04', 'seq_escape', 24000, 'closeUp', 'profile', 'handheld', 'whip', [cast[3]], 'profile speaking reaction'],
			['s05', 'seq_escape', 34000, 'tracking', 'side', 'truckRight', 'cut', cast, 'clarify chase action'],
			['s06', 'seq_escape', 44000, 'reaction', 'dutch', 'snapZoom', 'cut', [cast[4]], 'deliver comic reaction'],
			['s07', 'seq_chase', 48000, 'wide', 'lowAngle', 'truckLeft', 'matchCut', cast, 'show body acting'],
			['s08', 'seq_chase', 60000, 'overShoulder', 'threeQuarter', 'pushIn', 'cut', [cast[1], cast[2]], 'preserve eyeline'],
			['s09', 'seq_negotiation', 72000, 'twoShot', 'eyeLevel', 'locked', 'dissolve', [cast[0], cast[2]], 'stage negotiation'],
			['s10', 'seq_negotiation', 84000, 'closeUp', 'highAngle', 'slowPush', 'cut', [cast[3]], 'show vulnerable comedy'],
			['s11', 'seq_tag', 96000, 'group', 'eyeLevel', 'pullBack', 'iris', cast, 'restore ensemble symmetry'],
			['s12', 'seq_tag', 108000, 'insert', 'topDown', 'tiltDown', 'cut', [cast[1]], 'reveal calendar prop']
		];

		return rows.map((row, index) => this.shot(row, index, rows));
	}

	static cast(id) {
		return [
			id('inventorParent'),
			id('practicalParent'),
			id('brainyKid'),
			id('wildToddler'),
			id('dryTalkingPet')
		];
	}

	static shot(row, index, rows) {
		const end = rows[index + 1]?.[2] ?? 120000;
		return {
			id: row[0],
			sequenceId: row[1],
			start: row[2],
			duration: end - row[2],
			camera: { size: row[3], angle: row[4], move: row[5], purpose: row[8] },
			transition: row[6],
			characters: row[7],
			composition: { thirdsBias: index % 2 ? 'right' : 'left', depthLayers: 3, motivatedFocus: true },
			continuity: { screenDirection: 'leftToRight', eyeLineAxis: 'strategyRoomAxis', bubbleSafe: true }
		};
	}
}
