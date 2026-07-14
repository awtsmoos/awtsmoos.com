// B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Five distinct installed voices carry five original identities. The Awtsmoos
 * renews breath and meaning while Awtsmoos.com records exactly which local voice
 * rendered every line instead of claiming an external AI provider was used.
 */
export class FourMinuteVoiceBuilder {
	static build(plan, outputDirectory) {
		const voiceDirectory = join(outputDirectory, 'voices');
		mkdirSync(voiceDirectory, { recursive: true });
		const available = this.availableEnglishVoices();
		const assignments = new Map(
			plan.characters.map((character, index) => [
				character.identityId,
				available[index % available.length]
			])
		);

		return plan.dialogue.map((line, index) => {
			const character = plan.characters.find(item => item.identityId === line.speakerId);
			const voice = assignments.get(line.speakerId);
			const file = join(voiceDirectory, `${String(index + 1).padStart(2, '0')}-${this.slug(line.speakerName)}.aiff`);
			const rate = Math.round(172 * Number(character.voice?.pace || 1));
			const result = spawnSync('say', [
				'-v',
				voice,
				'-r',
				String(rate),
				'-o',
				file,
				line.text
			], {
				encoding: 'utf8'
			});
			if (result.status !== 0) {
				throw new Error(result.stderr || `Speech synthesis failed for ${line.id}.`);
			}
			return {
				lineId: line.id,
				characterId: line.speakerId,
				speakerName: line.speakerName,
				voice,
				voiceId: line.voiceId,
				start: line.start,
				file,
				text: line.text,
				provenance: 'macOS local speech synthesis'
			};
		});
	}

	static availableEnglishVoices() {
		const result = spawnSync('say', ['-v', '?'], {
			encoding: 'utf8'
		});
		if (result.status !== 0) {
			throw new Error(result.stderr || 'Unable to inspect local speech voices.');
		}
		const voices = result.stdout.split('\n').map(line => {
			const match = line.match(/^(.+?)\s{2,}(en_[A-Z]{2})\s+/u);
			return match?.[1]?.trim() || null;
		}).filter(Boolean);
		if (voices.length < 5) {
			throw new Error('At least five installed English voices are required.');
		}
		return voices;
	}

	static slug(value) {
		return String(value).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
	}
}
