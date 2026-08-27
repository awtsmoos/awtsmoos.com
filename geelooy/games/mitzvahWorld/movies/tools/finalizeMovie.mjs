// B"H
/** @file finalizeMovie.mjs @description Normalizes browser WebM and adds JSON-timed dialogue. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	FFMPEG,
	createSpeechFiles,
	dialoguePlan,
	filterGraph,
	run,
	writeReport
} from './movieFinalizeSupport.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MOVIES = path.resolve(HERE, '..');

function pathsFromArguments() {
	const args = process.argv.slice(2).filter((item) => item !== '--probe-only');
	return {
		projectFile: args[0] || path.join(MOVIES, 'projects/chossid-journey-30s.json'),
		source: args[1] || path.join(MOVIES, 'chossid-journey-30s-browser-master.webm'),
		output: args[2] || path.join(MOVIES, 'chossid-journey-30s.mp4')
	};
}

function ffmpegArguments(project, source, output, speeches) {
	const args = ['-y', '-fflags', '+genpts', '-i', source];
	for (const speech of speeches) args.push('-i', speech.file);
	args.push(
		'-filter_complex', filterGraph(project, speeches),
		'-map', '[v]', '-map', '[a]',
		'-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
		'-pix_fmt', 'yuv420p', '-r', String(project.fps),
		'-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
		'-movflags', '+faststart', '-t', String(project.duration), output
	);
	return args;
}

function main() {
	const { projectFile, source, output } = pathsFromArguments();
	const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
	const dialogues = dialoguePlan(project);
	if (process.argv.includes('--probe-only')) {
		writeReport(MOVIES, output, projectFile, source, dialogues);
		return;
	}
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-movie-'));
	try {
		const speeches = createSpeechFiles(dialogues, directory);
		run(FFMPEG, ffmpegArguments(project, source, output, speeches));
		writeReport(MOVIES, output, projectFile, source, dialogues);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

main();
