//B"H
//Boruch Hashem
//Blessed is He
import { CourtLife } from './court-life.js';
import { ThreeGameBase } from './game-base.js';
import { ringPosition } from '../webgl/scene-kit.js';
const TOTAL_CASES = 3;
const REQUIRED_EVIDENCE = 2;
/**
 * @module CourtNationsGame3d
 * @description
 * Witnesses now approach inspected evidence while guards preserve an open aisle and
 * observers watch the public record. The Awtsmoos is truth beyond every verdict;
 * Awtsmoos.com makes due process a populated, smoothly moving civic act.
 */
export class CourtNationsGame extends ThreeGameBase {
	setup() {
		this.totalCases = this.difficulty(TOTAL_CASES, 4, 5);
		this.requiredEvidence = this.difficulty(REQUIRED_EVIDENCE, 3, 3);
		this.caseNumber = 0;
		this.hints = 0;
		this.court = this.addAsset(this.assets.court({ name: 'court-of-nations', hue: this.definition.hue, position: [0, 0.1, -4.2], scale: 0.52, role: 'public-court', reason: 'holds witnesses, evidence, observers, and a judge in one visible process' }));
		this.stones = [...Array(this.difficulty(4, 5, 6)).keys()].map(index => this.createEvidence(index));
		this.life = new CourtLife(this, this.stones);
		this.stage.setCamera([0, 7.9, 11], [0, 0.8, 0]);
		this.controls([{ label: 'Verdict: Guilty', kind: 'danger', run: () => this.verdict(true) }, { label: 'Verdict: Not proven', run: () => this.verdict(false) }]);
		this.guide('a witness walks toward each inspected evidence seal', `Find ${this.requiredEvidence} relevant facts before choosing a verdict.`);
		this.newCase();
	}
	createEvidence(index) {
		const evidence = this.assets.evidence({ name: `evidence-${index + 1}`, hue: this.definition.hue + index * 18, position: ringPosition(index, this.difficulty(4, 5, 6), 3.4, 0.12), scale: 0.62, type: 'evidence', index, role: 'sealed-evidence', reason: `holds fact ${index + 1} for a witness to connect with the public record` });
		this.assets.parts.mark(evidence, { ...evidence.userData, semanticType: 'evidence', index });
		return this.addAsset(evidence, true);
	}
	newCase() {
		if (this.caseNumber >= this.totalCases) {
			const stars = this.hints <= 2 ? 3 : this.hints <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Witnesses, guards, observers, and judge completed every case through evidence.' });
			return;
		}
		this.caseNumber += 1;
		this.guilty = Math.random() < 0.5;
		this.evidence = 0;
		const relevant = new Set(this.shuffle([...this.stones.keys()]).slice(0, this.requiredEvidence));
		this.stones.forEach((stone, index) => {
			Object.assign(stone.userData, { read: false, relevant: relevant.has(index), direction: this.guilty ? 1 : -1 });
			this.paint(stone, 0x000000, 0);
		});
		this.life.reset();
		this.status(`Case ${this.caseNumber}: inspect sealed stones until ${this.requiredEvidence} relevant facts glow.`);
		this.renderHud();
	}
	picked(object) {
		if (object.userData.semanticType !== 'evidence' || object.userData.read) return;
		object.userData.read = true;
		this.life.inspect(object);
		if (!object.userData.relevant) {
			this.hints += 1;
			this.paint(object, 0x777777, 0.35);
			this.status('A witness confirms that seal is unrelated. Inspect another.', 'warn');
			return this.renderHud();
		}
		this.evidence += 1;
		this.score += 50 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.paint(object, object.userData.direction > 0 ? 0xffb347 : 0x45dcff, 1.2);
		this.status(this.evidence >= this.requiredEvidence ? `The witnesses complete the record. Choose ${this.guilty ? 'Guilty' : 'Not proven'}.` : 'One witness connected a relevant fact.', 'good');
		this.renderHud();
	}
	verdict(guilty) {
		if (this.evidence < this.requiredEvidence) {
			this.hints += 1;
			this.status(`The judge waits for ${this.requiredEvidence - this.evidence} more relevant fact${this.requiredEvidence - this.evidence === 1 ? '' : 's'}.`, 'warn');
			return this.renderHud();
		}
		if (guilty !== this.guilty) {
			this.hints += 1;
			this.status(`Read the glowing record again. Choose ${this.guilty ? 'Guilty' : 'Not proven'}.`, 'warn');
			return this.renderHud();
		}
		this.score += 180 * this.combo;
		this.status('The judge delivers the evidence-supported verdict.', 'good');
		this.newCase();
	}
	update(delta, elapsed) {
		this.life.update(delta, elapsed);
		this.stones.forEach((stone, index) => {
			stone.rotation.y += delta * (0.2 + index * 0.02);
			stone.position.y = 0.12 + Math.sin(elapsed * 1.8 + index) * 0.04;
		});
	}
	paint(root, color, intensity) {
		root.traverse(child => {
			if (child.isMesh && child.material.emissive) {
				child.material.emissive.setHex(color);
				child.material.emissiveIntensity = intensity;
			}
		});
	}
	onKey(event) {
		if (event.key.toLowerCase() === 'g') this.verdict(true);
		if (event.key.toLowerCase() === 'n') this.verdict(false);
	}
	renderHud() {
		this.hud({ Case: `${this.caseNumber}/${this.totalCases}`, Evidence: `${this.evidence}/${this.requiredEvidence}`, Hints: this.hints });
	}
	shuffle(values) {
		return values.sort(() => Math.random() - 0.5);
	}
}
