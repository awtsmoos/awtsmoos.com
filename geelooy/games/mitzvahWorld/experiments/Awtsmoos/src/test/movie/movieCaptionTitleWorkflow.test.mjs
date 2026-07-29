// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMovieCaptions, serializeMovieCaptions } from '../../movie/MovieCaptionCodec.js';
import { executeMovieCaptionCommand } from '../../movie/MovieCaptionCommands.js';
import { executeMovieTitleCommand } from '../../movie/MovieTitleCommands.js';

function project() {
	return { duration: 20, media: [], tracks: [] };
}

test('SRT and WebVTT parse and serialize deterministic caption clips', () => {
	const srt = [
		'1',
		'00:00:01,000 --> 00:00:03,500',
		'Shalom world',
		'',
		'2',
		'00:00:04,000 --> 00:00:05,000',
		'A mitzvah begins.'
	].join('\n');
	const clips = parseMovieCaptions(srt, { language: 'en' });
	assert.deepEqual(clips.map(clip => [clip.start, clip.duration]), [
		[1, 2.5],
		[4, 1]
	]);
	assert.match(serializeMovieCaptions(clips, { format: 'vtt' }), /^WEBVTT/);
	assert.deepEqual(
		parseMovieCaptions(serializeMovieCaptions(clips, { format: 'srt' })),
		clips
	);
});

test('title and caption commands create normalized text tracks', () => {
	const titled = executeMovieTitleCommand(project(), 'addTitle', {
		title: {
			duration: 3,
			start: 0,
			subtitle: 'A generated world',
			text: 'MitzvahWorld',
			variant: 'card'
		}
	});
	assert.equal(titled.project.tracks.at(-1).type, 'title');
	const captioned = executeMovieCaptionCommand(titled.project, 'addCaption', {
		caption: {
			duration: 2,
			speaker: 'Ari',
			start: 1,
			text: 'Let us help.'
		}
	});
	const captions = captioned.project.tracks.find(track => track.type === 'caption');
	assert.equal(captions.clips[0].speaker, 'Ari');
	assert.doesNotThrow(() => JSON.stringify(captioned.project));
});
