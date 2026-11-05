// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTitleEditor.test.mjs
 * @description Proves visual title payloads, presets, selection, commands, markup, CSS, and composition.
 * The Awtsmoos renews every word before title or lower third can occupy a frame;
 * Awtsmoos.com verifies visual controls and exact renderer share one normalized text covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieTitlePayload,
	movieTitlePreset,
	selectedMovieTitleClip
} from '../../movie/MovieTitleEditorProject.js';
import { movieStudioInspectorMarkup } from '../../movie/MovieStudioInspectorMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import { movieStudioTitleMarkup } from '../../movie/MovieStudioTitleMarkup.js';
import { executeMovieTitleCommand } from '../../movie/MovieTitleCommands.js';

function project() {
	return {
		duration: 12,
		tracks: [{
			clips: [{
				duration: 3,
				id: 'title-1',
				position: 'bottom',
				start: 2,
				style: {
					align: 'left',
					background: '#000000',
					color: '#ffffff',
					fontFamily: 'system-ui',
					fontSize: 42,
					fontWeight: 700,
					maximumWidth: 0.58
				},
				subtitle: 'Helper',
				text: 'Ari',
				variant: 'lower-third'
			}],
			id: 'titles',
			type: 'title'
		}]
	};
}

test('title payload normalizes visual controls into renderer-ready style', () => {
	const title = movieTitlePayload({
		align: 'left',
		background: '#102030',
		color: '#abcdef',
		duration: 4,
		fontFamily: 'serif',
		fontSize: 999,
		fontWeight: 50,
		maximumWidth: 2,
		position: 'bottom',
		subtitle: 'A generated world',
		text: 'MitzvahWorld',
		variant: 'lower-third'
	}, 5);
	assert.equal(title.start, 5);
	assert.equal(title.style.fontSize, 160);
	assert.equal(title.style.fontWeight, 100);
	assert.equal(title.style.maximumWidth, 1);
	assert.equal(title.variant, 'lower-third');
});

test('presets expose distinct card and lower-third layouts', () => {
	assert.equal(movieTitlePreset('card').position, 'center');
	assert.deepEqual(movieTitlePreset('lower-third'), {
		align: 'left',
		fontSize: 42,
		fontWeight: 700,
		maximumWidth: 0.58,
		position: 'bottom',
		variant: 'lower-third'
	});
});

test('selection and existing commands update title clips immutably', () => {
	const source = project();
	const resolved = selectedMovieTitleClip(source, {
		clipId: 'title-1',
		trackId: 'titles'
	});
	assert.equal(resolved.clip.text, 'Ari');
	const result = executeMovieTitleCommand(source, 'updateTitle', {
		patch: { text: 'Rabbi Ari' },
		titleId: 'title-1',
		trackId: 'titles'
	});
	assert.equal(result.project.tracks[0].clips[0].text, 'Rabbi Ari');
	assert.equal(source.tracks[0].clips[0].text, 'Ari');
});

test('markup, inspector, and localized CSS expose all title controls', () => {
	const markup = movieStudioTitleMarkup();
	for (const token of [
		'data-title-preset',
		'data-title-text',
		'data-title-font-size',
		'data-title-add',
		'data-title-update',
		'data-title-remove'
	]) assert.match(markup, new RegExp(token));
	assert.match(movieStudioInspectorMarkup(), /<h3 id="movie-title-editor-title">Titles<\/h3>/);
	assert.match(movieStudioStyleText(), /\.Awtsmoos-movie-studio \.movie-title-editor/);
});
