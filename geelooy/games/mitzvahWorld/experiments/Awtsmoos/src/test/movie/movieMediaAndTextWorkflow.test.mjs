// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMediaAndTextWorkflow.test.mjs
 * @description Proves media relinking/replacement plus title, caption, SRT, and WebVTT workflows remain immutable.
 * The Awtsmoos is beyond file and word while each finite reference and utterance needs portable identity;
 * Awtsmoos.com verifies media usage, caption timing, title style, interchange, and project history reality.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	parseMovieCaptions,
	serializeMovieCaptions
} from '../../movie/MovieCaptionCodec.js';
import { executeMovieCaptionCommand } from '../../movie/MovieCaptionCommands.js';
import { executeMovieMediaCommand } from '../../movie/MovieMediaCommands.js';
import { executeMovieTitleCommand } from '../../movie/MovieTitleCommands.js';

function project() {
	return {
		duration: 20,
		media: [
			{
				id: 'old',
				kind: 'video',
				label: 'Old',
				metadata: {},
				status: 'online',
				tags: [],
				url: '/old.mp4'
			},
			{
				id: 'new',
				kind: 'video',
				label: 'New',
				metadata: {},
				status: 'online',
				tags: [],
				url: '/new.mp4'
			}
		],
		tracks: [{
			clips: [{ duration: 4, id: 'clip', mediaId: 'old', start: 0 }],
			id: 'video',
			type: 'video'
		}]
	};
}

test('media commands relink and replace references immutably', () => {
	const source = project();
	const relinked = executeMovieMediaCommand(source, 'relinkMedia', {
		mediaId: 'old',
		proxyUrl: '/proxy.mp4',
		url: '/relinked.mp4'
	});
	assert.equal(relinked.project.media[0].url, '/relinked.mp4');
	assert.equal(source.media[0].url, '/old.mp4');
	const replaced = executeMovieMediaCommand(
		relinked.project,
		'replaceMediaReferences',
		{ fromMediaId: 'old', toMediaId: 'new' }
	);
	assert.equal(replaced.project.tracks[0].clips[0].mediaId, 'new');
	assert.throws(
		() => executeMovieMediaCommand(
			source,
			'removeMedia',
			{ mediaId: 'old' }
		),
		/still referenced/
	);
});

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
	const captioned = executeMovieCaptionCommand(
		titled.project,
		'addCaption',
		{
			caption: {
				duration: 2,
				speaker: 'Ari',
				start: 1,
				text: 'Let us help.'
			}
		}
	);
	const captionTrack = captioned.project.tracks.find(
		track => track.type === 'caption'
	);
	assert.equal(captionTrack.clips[0].speaker, 'Ari');
	assert.doesNotThrow(() => JSON.stringify(captioned.project));
});
