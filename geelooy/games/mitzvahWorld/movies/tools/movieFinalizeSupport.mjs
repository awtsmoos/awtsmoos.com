// B"H
/** @file movieFinalizeSupport.mjs @description Speech, probe, hash, and FFmpeg graph helpers. */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const FFMPEG = '/usr/local/bin/ffmpeg';
export const FFPROBE = '/usr/local/bin/ffprobe';
const SAY = '/usr/bin/say';

export function run(command, args, capture = false) {
	const result = spawnSync(command, args, {
		encoding: 'utf8',
		stdio: capture ? 'pipe' : 'inherit'
	});
	if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.status}`);
	return result;
}

function availableVoices() {
	return new Set(run(SAY, ['-v', '?'], true).stdout
		.split('\n').map((line) => line.trim().split(/\s+/)[0]).filter(Boolean));
}

function voiceFor(speaker, available) {
	const choices = speaker === 'Narrator'
		? ['Samantha', 'Karen', 'Moira', 'Alex']
		: speaker === 'Reb Mendel'
			? ['Daniel', 'Rishi', 'Alex', 'Fred']
			: ['Aaron', 'Alex', 'Daniel', 'Fred'];
	return choices.find((voice) => available.has(voice)) || Array.from(available)[0];
}

export function dialoguePlan(project) {
	const available = availableVoices();
	const clips = project.tracks.find((track) => track.type === 'dialogue')?.clips || [];
	return clips.map((clip) => ({
		speaker: clip.speaker,
		text: clip.text,
		start: clip.start,
		duration: clip.duration,
		voice: voiceFor(clip.speaker, available)
	}));
}

export function createSpeechFiles(plan, directory) {
	return plan.map((dialogue, index) => {
		const file = path.join(directory, `speech-${index}.aiff`);
		const rate = dialogue.speaker === 'Narrator' ? '175' : '188';
		run(SAY, ['-v', dialogue.voice, '-r', rate, '-o', file, dialogue.text]);
		return { ...dialogue, file };
	});
}

export function filterGraph(project, speeches) {
	const filters = [
		`[0:v]setpts=PTS-STARTPTS,fps=${project.fps},scale=${project.resolution.width}:${project.resolution.height}:flags=lanczos,trim=duration=${project.duration}[v]`,
		`[0:a]aresample=48000,asetpts=PTS-STARTPTS,atrim=duration=${project.duration},volume=.42[base]`
	];
	speeches.forEach((item, index) => {
		filters.push(`[${index + 1}:a]aresample=48000,adelay=${Math.round(item.start * 1000)}:all=1,volume=1.25[s${index}]`);
	});
	const inputs = ['[base]', ...speeches.map((_, index) => `[s${index}]`)].join('');
	filters.push(`${inputs}amix=inputs=${speeches.length + 1}:duration=longest:normalize=0,alimiter=limit=.95,atrim=duration=${project.duration}[a]`);
	return filters.join(';');
}

function probe(file) {
	return JSON.parse(run(FFPROBE, [
		'-v', 'error', '-show_entries', 'format=duration,size,format_name,bit_rate',
		'-show_entries', 'stream=index,codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels,nb_frames',
		'-of', 'json', file
	], true).stdout);
}

function hash(file) {
	return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function writeReport(moviesRoot, output, projectFile, source, dialogues) {
	const report = {
		output: path.relative(moviesRoot, output),
		project: path.relative(moviesRoot, projectFile),
		source: path.relative(moviesRoot, source),
		sha256: hash(output),
		dialogues,
		probe: probe(output)
	};
	fs.writeFileSync(`${output}.ffprobe.json`, `${JSON.stringify(report, null, 2)}\n`);
	console.log(JSON.stringify(report, null, 2));
}
