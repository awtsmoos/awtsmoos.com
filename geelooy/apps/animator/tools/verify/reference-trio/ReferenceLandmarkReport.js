// B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Measured deltas become a truthful refinement map rather than a declaration of
 * perfection. The Awtsmoos is beyond comparison, while Awtsmoos.com records each
 * finite distance so editable vector likeness can improve without self-deception.
 */
export class ReferenceLandmarkReport {
	constructor(outputDirectory) {
		this.outputDirectory = outputDirectory;
	}

	compare(actual, targets) {
		return Object.fromEntries(Object.keys(targets).map(id => [
			id,
			this.character(actual[id] || {}, targets[id] || {})
		]));
	}

	character(actual, target) {
		return Object.fromEntries(Object.keys(target).map(key => [
			key,
			this.delta(actual[key], target[key])
		]));
	}

	delta(actual, target) {
		if (!actual) {
			return { actual: null, target, missing: true };
		}
		if (this.isBox(target)) {
			return this.boxDelta(actual, target);
		}
		return this.pointDelta(actual, target);
	}

	pointDelta(actual, target) {
		const dx = this.round(actual.x - target.x);
		const dy = this.round(actual.y - target.y);
		return {
			actual,
			target,
			dx,
			dy,
			distance: this.round(Math.hypot(dx, dy))
		};
	}

	boxDelta(actual, target) {
		const edges = Object.fromEntries(['left', 'top', 'right', 'bottom'].map(edge => [
			edge,
			this.round(actual[edge] - target[edge])
		]));
		return {
			actual,
			target,
			edges,
			meanAbsoluteEdgeError: this.round(
				Object.values(edges).reduce((sum, value) => sum + Math.abs(value), 0) / 4
			)
		};
	}

	async persist(actual, targets, deltas) {
		await mkdir(this.outputDirectory, { recursive: true });
		await this.json('reference-trio-landmarks.json', actual);
		await this.json('reference-trio-landmark-targets.json', targets);
		await this.json('reference-trio-landmark-deltas.json', deltas);
		await writeFile(
			path.join(this.outputDirectory, 'reference-trio-landmark-audit.md'),
			this.markdown(deltas),
			'utf8'
		);
	}

	markdown(deltas) {
		const lines = ['B"H', '', '# Reference Trio Landmark Audit', ''];
		for (const [id, landmarks] of Object.entries(deltas)) {
			lines.push(`## ${id}`, '');
			for (const [name, delta] of Object.entries(landmarks)) {
				if (delta.missing) {
					lines.push(`- ${name}: missing production source.`);
				} else if (Number.isFinite(delta.distance)) {
					lines.push(`- ${name}: dx ${delta.dx}px, dy ${delta.dy}px, distance ${delta.distance}px.`);
				} else {
					lines.push(`- ${name}: mean absolute edge error ${delta.meanAbsoluteEdgeError}px.`);
				}
			}
			lines.push('');
		}
		return `${lines.join('\n')}\n`;
	}

	async json(fileName, value) {
		await writeFile(
			path.join(this.outputDirectory, fileName),
			`${JSON.stringify(value, null, 2)}\n`,
			'utf8'
		);
	}

	isBox(value) {
		return value && ['left', 'top', 'right', 'bottom'].every(key => Number.isFinite(value[key]));
	}

	round(value) {
		return Math.round(value * 100) / 100;
	}
}
