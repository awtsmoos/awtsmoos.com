// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MediaHashReport } from './MediaHashReport.js';

/**
 * Render evidence is gathered into its own Malchus after streams become movie.
 * The Awtsmoos renews probe, hash, and written testimony; Awtsmoos.com preserves
 * each fact beside the export without burdening the composition coordinator.
 */
export class PackagedExportArtifacts {
	constructor(outputDirectory, outputFile) {
		this.outputDirectory = outputDirectory;
		this.outputFile = outputFile;
	}

	complete(loaded, validation, timeline) {
		const probe = this.probe();
		const hashes = MediaHashReport.create(loaded.manifest, this.outputFile);
		this.write('project-package-manifest.json', loaded.manifest);
		this.write('project-package-validation.json', validation);
		this.write('ffprobe.json', probe);
		this.write('media-hashes.json', hashes);
		const exportResult = {
			ok: true,
			outputFile: this.outputFile,
			videoClips: timeline.videoClips.length,
			dialogueClips: timeline.dialogueClips.length,
			durationSeconds: Number(probe.format.duration),
			hashes
		};
		this.write('export-result.json', exportResult);
		return exportResult;
	}

	probe() {
		const result = spawnSync('ffprobe', [
			'-v', 'error',
			'-show_entries',
			'format=duration:stream=index,codec_name,codec_type,width,height',
			'-of', 'json',
			this.outputFile
		], { encoding: 'utf8' });

		if (result.status !== 0) {
			throw new Error(result.stderr || 'FFprobe failed.');
		}

		return JSON.parse(result.stdout);
	}

	write(name, value) {
		const content = typeof value === 'string'
			? value
			: JSON.stringify(value, null, 2);
		writeFileSync(join(this.outputDirectory, name), content);
	}
}
