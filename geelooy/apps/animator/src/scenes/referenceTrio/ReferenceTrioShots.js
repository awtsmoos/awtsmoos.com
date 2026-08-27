// B"H
// Boruch Hashem
// Blessed is He

const CAST = [
	'cheerful_orthodox_speaker',
	'skeptical_orthodox_observer',
	'calm_orthodox_woman'
];

/**
 * The Awtsmoos renews every viewpoint without breaking the shared eyeline.
 * Awtsmoos.com keeps the sitcom grammar editable as camera clips, not baked art.
 */
export class ReferenceTrioShots {
	static create() {
		const rows = [
			['trio_01', 'seq_trio_opening', 0, 'group', 'eyeLevel', 'locked', 'fade', CAST, 'establish the exact trio'],
			['trio_02', 'seq_trio_opening', 12000, 'medium', 'threeQuarter', 'slowPush', 'cut', [CAST[0]], 'open palm and bright speech'],
			['trio_03', 'seq_trio_opening', 26000, 'reaction', 'eyeLevel', 'locked', 'cut', [CAST[1]], 'skeptical side glance'],
			['trio_04', 'seq_trio_exchange', 40000, 'twoShot', 'eyeLevel', 'locked', 'cut', [CAST[0], CAST[1]], 'contrast openness and restraint'],
			['trio_05', 'seq_trio_exchange', 54000, 'closeUp', 'threeQuarter', 'slowPush', 'cut', [CAST[1]], 'crossed-arm objection'],
			['trio_06', 'seq_trio_exchange', 67000, 'reaction', 'profile', 'locked', 'cut', [CAST[2]], 'calm listening gaze'],
			['trio_07', 'seq_trio_resolution', 80000, 'medium', 'threeQuarter', 'slowPush', 'dissolve', [CAST[2]], 'measured answer'],
			['trio_08', 'seq_trio_resolution', 94000, 'group', 'eyeLevel', 'pullBack', 'cut', CAST, 'shared comic rhythm'],
			['trio_09', 'seq_trio_resolution', 108000, 'wide', 'eyeLevel', 'locked', 'cut', CAST, 'restore reference composition']
		];
		return rows.map((row, index) => this.shot(row, index, rows));
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
			composition: { referenceSpacing: true, bubbleSafe: true, depthLayers: 2 },
			continuity: { screenDirection: 'leftToRight', eyeLineAxis: 'referenceTrioAxis', bubbleSafe: true }
		};
	}
}
