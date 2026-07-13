//B"H
// Boruch Hashem
// Blessed is He
/**
 * Arithmetic remains readable above raw WebGL even when Beriah changes its measure.
 * The Awtsmoos is beyond number while Awtsmoos.com reveals each finite gate.
 */
import { projectPoint } from '../render/ProjectionMath.js';

export class GateLabelLayer {
	constructor(root) {
		this.root = root;
		this.labels = new Map();
	}

	sync(gates) {
		const activeIds = new Set();
		for (const gate of gates) {
			activeIds.add(gate.id);
			const label = this.ensureLabel(gate);
			this.updateContent(label, gate);
			this.updatePosition(label, gate);
		}
		for (const [id, element] of this.labels) {
			if (!activeIds.has(id)) {
				element.remove();
				this.labels.delete(id);
			}
		}
	}

	ensureLabel(gate) {
		if (this.labels.has(gate.id)) {
			return this.labels.get(gate.id);
		}
		const label = document.createElement('div');
		label.className = 'gate-label';
		this.root.append(label);
		this.labels.set(gate.id, label);
		return label;
	}

	updateContent(label, gate) {
		if (label.textContent !== gate.label) {
			label.textContent = gate.label;
		}
		label.classList.toggle('positive', gate.kind === 'positive');
		label.classList.toggle('negative', gate.kind !== 'positive');
	}

	updatePosition(label, gate) {
		const projected = projectPoint([gate.x, 3.35, gate.z]);
		label.style.left = `${projected.x * 100}%`;
		label.style.top = `${projected.y * 100}%`;
		label.style.opacity = projected.visible ? '1' : '0';
		label.style.transform = `translate(-50%, -50%) scale(${projected.scale})`;
	}

	clear() {
		for (const element of this.labels.values()) {
			element.remove();
		}
		this.labels.clear();
	}
}
