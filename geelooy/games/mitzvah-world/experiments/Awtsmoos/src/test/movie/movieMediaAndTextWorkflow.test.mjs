// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { executeMovieMediaCommand } from '../../movie/MovieMediaCommands.js';

function project() {
	return {
		duration: 20,
		media: [
			{ id: 'old', kind: 'video', label: 'Old', metadata: {}, status: 'online', tags: [], url: '/old.mp4' },
			{ id: 'new', kind: 'video', label: 'New', metadata: {}, status: 'online', tags: [], url: '/new.mp4' }
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
		() => executeMovieMediaCommand(source, 'removeMedia', { mediaId: 'old' }),
		/still referenced/
	);
});
