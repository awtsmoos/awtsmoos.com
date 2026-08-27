// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * Authored dialogue becomes audible breath without changing its timeline truth.
 * The Awtsmoos renews voice from letters while Awtsmoos.com preserves every
 * speaker, rate, source line, and generated file for repeatable final export.
 */
export class OneMinuteVoiceTrackBuilder {
	constructor(plan, paths) {
		this.plan = plan;
		this.paths = paths;
		this.availableVoices = this.voices();
	}

	build() {
		return this.plan.dialogue.map((line, index) => {
			const voice = this.voice(line.voice);
			const file = join(this.paths.audio, `${String(index + 1).padStart(2, '0')}-${line.id}.aiff`);
			const result = spawnSync('say', [
				'-v', voice, '-r', String(line.speechRate || 170), '-o', file, line.text
			], { encoding: 'utf8' });
			if (result.status !== 0) {
				throw new Error(result.stderr || `Voice generation failed for ${line.id}.`);
			}
			return { id: line.id, file, voice, start: line.start, duration: line.duration };
		});
	}

	voices() {
		const result = spawnSync('say', ['-v', '?'], { encoding: 'utf8' });
		if (result.status !== 0) {
			throw new Error(result.stderr || 'The macOS speech synthesizer is unavailable.');
		}
		return new Set(
			result.stdout.split('\n').map(line => line.trim().split(/\s{2,}/)[0]).filter(Boolean)
		);
	}

	voice(preferred) {
		if (this.availableVoices.has(preferred)) return preferred;
		for (const fallback of ['Samantha', 'Alex', 'Daniel', 'Karen']) {
			if (this.availableVoices.has(fallback)) return fallback;
		}
		return [...this.availableVoices][0];
	}
}
