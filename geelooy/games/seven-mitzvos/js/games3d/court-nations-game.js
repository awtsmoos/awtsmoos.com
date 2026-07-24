//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { pulseObject, ringPosition } from '../webgl/scene-kit.js';

const TOTAL_CASES = 3;
const REQUIRED_EVIDENCE = 2;

/**
 * @module CourtNationsGame3d
 * @description
 * Four stones, two useful facts, and three cases make due process approachable.
 * The Awtsmoos is truth beyond every verdict, while this easy Awtsmoos.com court
 * converts distraction and premature judgment into patient hints, never defeat.
 */
export class CourtNationsGame extends ThreeGameBase {
	setup() {
		this.caseNumber = 0;
		this.hints = 0;
		this.stones = [...Array(4).keys()].map(index => this.addVessel({
			hue: this.definition.hue + index * 24,
			position: ringPosition(index, 4, 3.5, 0.72),
			scale: [1.15, 1.5, 1.15],
			name: `evidence-${index + 1}`,
			userData: { type: 'evidence', index, phase: index }
		}, true));
		this.stage.setCamera([0, 7.8, 10.4], [0, 0.65, 0]);
		this.controls([
			{ label: 'Verdict: Guilty', kind: 'danger', run: () => this.verdict(true) },
			{ label: 'Verdict: Not proven', run: () => this.verdict(false) }
		]);
		this.newCase();
	}

	newCase() {
		if (this.caseNumber >= TOTAL_CASES) {
			const stars = this.hints <= 2 ? 3 : this.hints <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Three cases were decided by evidence, patience, and supported judgment.' });
			return;
		}
		this.caseNumber += 1;
		this.guilty = Math.random() < 0.5;
		this.evidence = 0;
		const relevant = new Set(this.shuffle([...Array(4).keys()]).slice(0, REQUIRED_EVIDENCE));
		this.stones.forEach((stone, index) => {
			Object.assign(stone.userData, { read: false, relevant: relevant.has(index), direction: this.guilty ? 1 : -1 });
			this.factory.setHue(stone, this.definition.hue + index * 24, 0.58);
			this.factory.setGlow(stone, 0x000000, 0);
		});
		this.status(`Case ${this.caseNumber}: tap stones until you find two relevant facts.`);
		this.renderHud();
	}

	picked(object) {
		if (object.userData.type !== 'evidence' || object.userData.read) return;
		object.userData.read = true;
		if (!object.userData.relevant) {
			this.hints += 1;
			this.factory.setGlow(object, 0x777777, 0.45);
			this.status('That stone is only a distraction. Try another—no fairness was lost.', 'warn');
			this.renderHud();
			return;
		}
		this.evidence += 1;
		this.score += 50 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.factory.setGlow(object, object.userData.direction > 0 ? 0xffb347 : 0x45dcff, 1.5);
		if (this.evidence >= REQUIRED_EVIDENCE) {
			this.status(`Evidence complete. Choose ${this.guilty ? 'Guilty' : 'Not proven'}.`, 'good');
		} else {
			this.status('One relevant fact found. Find one more.', 'good');
		}
		this.renderHud();
	}

	verdict(guilty) {
		if (this.evidence < REQUIRED_EVIDENCE) {
			this.hints += 1;
			this.status('First collect two glowing facts. The easy court will wait.', 'warn');
			this.renderHud();
			return;
		}
		if (guilty !== this.guilty) {
			this.hints += 1;
			this.status(`Read the record again. Choose ${this.guilty ? 'Guilty' : 'Not proven'}.`, 'warn');
			this.renderHud();
			return;
		}
		this.score += 180 * this.combo;
		this.status('The verdict follows the evidence.', 'good');
		this.newCase();
	}

	update(delta, elapsed) {
		this.stones.forEach((stone, index) => {
			stone.rotation.y += delta * (0.22 + index * 0.03);
			if (!stone.userData.read) pulseObject(stone, elapsed, 0.055, 3);
		});
	}

	onKey(event) {
		if (event.key.toLowerCase() === 'g') this.verdict(true);
		if (event.key.toLowerCase() === 'n') this.verdict(false);
	}

	renderHud() {
		this.hud({ Case: `${this.caseNumber}/${TOTAL_CASES}`, Evidence: `${this.evidence}/${REQUIRED_EVIDENCE}`, Hints: this.hints });
	}

	shuffle(values) {
		return values.sort(() => Math.random() - 0.5);
	}
}
