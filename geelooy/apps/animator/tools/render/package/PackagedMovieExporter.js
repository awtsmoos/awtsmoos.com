// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DialogueAudioFilterBuilder } from './DialogueAudioFilterBuilder.js';
import { MediaTimelineCompiler } from './MediaTimelineCompiler.js';
import { PackagedExportArtifacts } from './PackagedExportArtifacts.js';
import { ProjectPackageLoader } from './ProjectPackageLoader.js';
import { ProjectPackageValidator } from './ProjectPackageValidator.js';
import { VideoOverlayFilterBuilder } from './VideoOverlayFilterBuilder.js';

/**
 * Procedural picture, imported footage, recorded voice, and score meet in one
 * final vessel. The Awtsmoos renews every stream; Awtsmoos.com composes the
 * movie, delegates testimony, and releases temporary packages after the deed.
 */
export class PackagedMovieExporter {
	constructor(options) {
		this.packagePath = options.packagePath;
		this.baseMoviePath = options.baseMoviePath;
		this.outputDirectory = options.outputDirectory;
		this.outputFile = join(
			this.outputDirectory,
			options.outputFileName || 'awtsmoos-packaged-movie.mp4'
		);
		this.artifacts = new PackagedExportArtifacts(
			this.outputDirectory,
			this.outputFile
		);
	}

	export() {
		mkdirSync(this.outputDirectory, { recursive: true });
		const loaded = ProjectPackageLoader.load(this.packagePath);

		try {
			return this.exportLoaded(loaded);
		} finally {
			ProjectPackageLoader.cleanup(loaded);
		}
	}

	exportLoaded(loaded) {
		const validation = ProjectPackageValidator.assert(loaded);
		const timeline = MediaTimelineCompiler.compile(loaded);
		const video = VideoOverlayFilterBuilder.build(timeline);
		const audio = DialogueAudioFilterBuilder.build(timeline);
		const argumentsList = this.arguments(timeline, video, audio);
		const result = spawnSync('ffmpeg', argumentsList, { encoding: 'utf8' });
		this.artifacts.write('ffmpeg-command.json', {
			executable: 'ffmpeg',
			arguments: argumentsList
		});

		if (result.status !== 0) {
			this.artifacts.write(
				'ffmpeg-error.txt',
				result.stderr || result.stdout || 'Unknown FFmpeg error.'
			);
			throw new Error(`FFmpeg packaged export failed with code ${result.status}.`);
		}

		return this.artifacts.complete(loaded, validation, timeline);
	}

	arguments(timeline, video, audio) {
		const argumentsList = ['-y', '-i', this.baseMoviePath];

		for (const clip of timeline.videoClips) {
			argumentsList.push('-i', clip.path);
		}

		for (const clip of timeline.dialogueClips) {
			argumentsList.push('-i', clip.path);
		}

		const filters = [...video.filters, ...audio.filters].join(';');
		argumentsList.push(
			'-filter_complex', filters,
			'-map', `[${video.outputLabel}]`,
			'-map', `[${audio.outputLabel}]`,
			'-c:v', 'libx264',
			'-preset', 'veryfast',
			'-crf', '18',
			'-pix_fmt', 'yuv420p',
			'-c:a', 'aac',
			'-b:a', '160k',
			'-t', String(timeline.durationMs / 1000),
			'-movflags', '+faststart',
			this.outputFile
		);
		return argumentsList;
	}
}
