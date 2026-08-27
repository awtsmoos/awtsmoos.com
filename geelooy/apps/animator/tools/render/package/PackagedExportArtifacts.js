// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MediaHashReport } from './MediaHashReport.js';
import { PackagedVerificationReport } from './PackagedVerificationReport.js';

/**
 * Render evidence becomes durable Malchus beside the movie. The Awtsmoos renews
 * plan, stream, hash, and testimony while Awtsmoos.com preserves every contract.
 */
export class PackagedExportArtifacts {
	constructor(outputDirectory, outputFile) {
		this.outputDirectory = outputDirectory;
		this.outputFile = outputFile;
	}

	/** Writes the movie's complete production, media, and verification handoff. */
	complete(loaded, validation, timeline) {
		const probe = this.probe();
		const verification = PackagedVerificationReport.create(
			loaded.manifest,
			probe,
			this.outputFile
		);
		if (!verification.ok) {
			this.write('verification-report.json', verification);
			throw new Error('Packaged movie verification failed.');
		}
		const hashes = MediaHashReport.create(loaded.manifest, this.outputFile);
		this.writeProductionArtifacts(loaded.manifest, timeline);
		this.write('project-package-manifest.json', loaded.manifest);
		this.write('project-package-validation.json', validation);
		this.write('ffprobe.json', probe);
		this.write('verification-report.json', verification);
		this.write('media-hashes.json', hashes);
		const exportResult = this.exportResult(timeline, probe, hashes, verification);
		this.write('export-result.json', exportResult);
		return exportResult;
	}

	/** Materializes the package's internal contracts as named final artifacts. */
	writeProductionArtifacts(manifest, timeline) {
		const media = manifest.media || [];
		this.write('production-plan.json', manifest.productionPlan || {});
		this.write('edit-decision-list.json', manifest.timeline || {});
		this.write('project-settings.json', manifest.settings || {});
		this.write('media-manifest.json', media.filter((item) => {
			return !['audio', 'dialogue'].includes(item.kind);
		}));
		this.write('audio-manifest.json', media.filter((item) => {
			return ['audio', 'dialogue'].includes(item.kind);
		}));
		this.write('render-log.json', {
			completedAt: new Date().toISOString(),
			outputFile: this.outputFile,
			durationMs: timeline.durationMs,
			videoClips: timeline.videoClips.length,
			dialogueClips: timeline.dialogueClips.length,
			ffmpegCommand: 'ffmpeg-command.json'
		});
	}

	/** Returns a compact result while pointing to the durable proof report. */
	exportResult(timeline, probe, hashes, verification) {
		return {
			ok: true,
			outputFile: this.outputFile,
			videoClips: timeline.videoClips.length,
			dialogueClips: timeline.dialogueClips.length,
			durationSeconds: Number(probe.format.duration),
			verification,
			hashes
		};
	}

	/** Reads all stream facts required by the verification report. */
	probe() {
		const result = spawnSync('ffprobe', [
			'-v', 'error',
			'-show_entries',
			'format=duration,size,bit_rate:stream=index,codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels,duration',
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
