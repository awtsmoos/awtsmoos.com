// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StrategyShots.js
 * @description
 * Twenty-four motivated viewpoints turn one strategy chase into a genuinely cinematic two-minute edit.
 * The Awtsmoos renews lens, angle, movement, and body crossing while Awtsmoos.com
 * keeps every camera and blocking decision explicit enough to inspect, edit, and credit.
 */

const OR_SHOT_DURATION = 5000;

/** Builds three five-second camera setups for each of eight story sequences. */
export class StrategyShots {
	/** @param {Function} id Character-role resolver. @returns {object[]} Twenty-four editable shots. */
	static create(id) {
		const cast = this.cast(id);
		const rows = [
			['s01', 'seq_briefing', 0, 'wide', 'eyeLevel', 'slowPush', 'wide', 'fade', [0, 1, 2, 3], 'establish strategy room'],
			['s02', 'seq_briefing', 5000, 'closeUp', 'lowAngle', 'rackFocus', 'portrait', 'cut', [0, 1], 'Mira declares the rule'],
			['s03', 'seq_briefing', 10000, 'insert', 'topDown', 'craneDive', 'normal', 'cut', [2], 'paper begins to move'],
			['s04', 'seq_corridor', 15000, 'tracking', 'side', 'truckRight', 'wide', 'whip', [0, 2, 3, 4], 'family spills into corridor'],
			['s05', 'seq_corridor', 20000, 'overShoulder', 'threeQuarter', 'shoulderRun', 'normal', 'cut', [1, 2], 'eyeline across moving hallway'],
			['s06', 'seq_corridor', 25000, 'reaction', 'dutch', 'snapZoom', 'portrait', 'cut', [4], 'Quip reacts to ambulatory management'],
			['s07', 'seq_market', 30000, 'extremeWide', 'birdEye', 'droneDive', 'ultraWide', 'matchCut', [0, 1, 2, 3, 4], 'market geography and chase path'],
			['s08', 'seq_market', 35000, 'twoShot', 'profile', 'arcLeft', 'normal', 'cut', [2, 3], 'Nomi and Pip dodge stalls'],
			['s09', 'seq_market', 40000, 'closeUp', 'rearThreeQuarter', 'crashZoom', 'telephoto', 'smashCut', [1], 'Dov spots the bridge route'],
			['s10', 'seq_bridge', 45000, 'tracking', 'lowAngle', 'pursuit', 'wide', 'cut', [0, 1, 2, 3, 4], 'hard chase across bridge'],
			['s11', 'seq_bridge', 50000, 'extremeCloseUp', 'highAngle', 'handheld', 'portrait', 'cut', [0], 'Mira loses confidence for a beat'],
			['s12', 'seq_bridge', 55000, 'wide', 'aerialOblique', 'craneUp', 'ultraWide', 'dissolve', [0, 1, 2, 4], 'bridge expands beneath ensemble'],
			['s13', 'seq_greenhouse', 60000, 'group', 'eyeLevel', 'pullBack', 'wide', 'dissolve', [0, 1, 2, 3, 4], 'negotiation circle forms'],
			['s14', 'seq_greenhouse', 65000, 'overShoulder', 'threeQuarter', 'dollyIn', 'portrait', 'cut', [0, 2], 'Mira asks what the plan wants'],
			['s15', 'seq_greenhouse', 70000, 'reaction', 'wormEye', 'orbitRight', 'normal', 'cut', [3, 4], 'Pip translates from below foliage'],
			['s16', 'seq_stairwell', 75000, 'tracking', 'rearThreeQuarter', 'craneUp', 'wide', 'wipe', [0, 1, 2, 3], 'group climbs after the plan'],
			['s17', 'seq_stairwell', 80000, 'closeUp', 'profile', 'whipPan', 'portrait', 'cut', [1], 'calendar swings into action'],
			['s18', 'seq_stairwell', 85000, 'wide', 'dutch', 'craneDive', 'wide', 'matchCut', [1, 2, 4], 'stairs reverse visual direction'],
			['s19', 'seq_rooftop', 90000, 'extremeWide', 'aerialOblique', 'orbitRight', 'ultraWide', 'iris', [0, 1, 2, 3, 4], 'rooftop breath before truce'],
			['s20', 'seq_rooftop', 95000, 'twoShot', 'eyeLevel', 'slowPush', 'portrait', 'cut', [0, 1], 'parents agree on fewer meetings'],
			['s21', 'seq_rooftop', 100000, 'reaction', 'highAngle', 'rackFocus', 'telephoto', 'cut', [2, 4], 'Nomi and Quip share relief'],
			['s22', 'seq_plaza', 105000, 'wide', 'wormEye', 'truckLeft', 'wide', 'fade', [0, 1, 2, 3, 4], 'family enters dawn plaza'],
			['s23', 'seq_plaza', 110000, 'insert', 'topDown', 'crashZoom', 'normal', 'cut', [1], 'Tuesday wears shoes'],
			['s24', 'seq_plaza', 115000, 'group', 'birdEye', 'pullBack', 'ultraWide', 'fade', [0, 1, 2, 3, 4], 'final symmetrical release']
		];
		return rows.map((row, index) => this.shot(row, index, cast));
	}

	/** @param {Function} id Role resolver. @returns {string[]} Stable cast IDs. */
	static cast(id) {
		return [
			id('inventorParent'),
			id('practicalParent'),
			id('brainyKid'),
			id('wildToddler'),
			id('dryTalkingPet')
		];
	}

	/** @param {any[]} row Row data. @param {number} index Shot index. @param {string[]} cast Full cast. @returns {object} Shot descriptor. */
	static shot(row, index, cast) {
		const characters = row[8].map((castIndex) => cast[castIndex]);
		return {
			id: row[0],
			sequenceId: row[1],
			start: row[2],
			duration: OR_SHOT_DURATION,
			camera: {
				size: row[3],
				angle: row[4],
				move: row[5],
				lens: row[6],
				purpose: row[9],
				leadRoom: index % 2 ? 18 : -18
			},
			transition: row[7],
			characters,
			blocking: this.blocking(characters, index),
			composition: {
				thirdsBias: index % 2 ? 'right' : 'left',
				depthLayers: 4,
				motivatedFocus: true
			},
			continuity: {
				screenDirection: index >= 16 && index <= 17 ? 'rightToLeft' : 'leftToRight',
				eyeLineAxis: `strategyAxis-${Math.floor(index / 3) + 1}`,
				bubbleSafe: true
			}
		};
	}

	/** @param {string[]} characters Visible cast. @param {number} shotIndex Shot index. @returns {object} Per-character start/end blocking. */
	static blocking(characters, shotIndex) {
		const direction = shotIndex % 2 ? -1 : 1;
		return Object.fromEntries(characters.map((characterId, index) => {
			const lane = (index + 1) / (characters.length + 1);
			const depth = 0.38 + ((index + shotIndex) % 4) * 0.13;
			const travel = 34 + (shotIndex % 4) * 18;
			const startX = 640 * lane - direction * travel;
			return [characterId, {
				start: { x: startX, y: 316 - depth * 10, depth },
				end: { x: startX + direction * travel * 2, y: 308 - depth * 14, depth: Math.min(0.9, depth + 0.08) },
				focus: index === shotIndex % characters.length ? 1 : 0.52,
				enterAt: 0,
				exitAt: 1
			}];
		}));
	}
}
