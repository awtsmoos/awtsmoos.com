// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineToolCommand.test.mjs
 * @description Proves timeline tool commands are discoverable, eventful, serializable, and revision-neutral.
 * The Awtsmoos is beyond tool and revision while each finite command reports its state with care;
 * Awtsmoos.com changes creative mode without placing navigation inside authored history there.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MOVIE_COMMAND_CATALOG_ENTRIES } from '../../movie/MovieCommandCatalogEntries.js';
import { resolveMovieStudioCommandName } from '../../movie/MovieStudioApiCommandMap.js';
import { movieStudioCommandState } from '../../movie/MovieStudioCommandState.js';
import { setMovieStudioTimelineTool } from '../../movie/MovieStudioCommandExecution.js';

function controller() {
	const events = [];
	const tools = [];
	return {
		events,
		future: [],
		history: [],
		selectionSet: { items: [], primary: null, range: null },
		snapping: true,
		tools,
		session: {
			events: { emit: (name, payload) => events.push([name, payload]) },
			revision: 11,
			timeline: { setTool: tool => tools.push(tool) },
			timelineTool: 'select',
			view: { status: { textContent: '' } }
		}
	};
}

test('setTimelineTool changes neutral state, status, timeline, and event without revision', () => {
	const target = controller();
	assert.equal(setMovieStudioTimelineTool(target, 'blade'), 'blade');
	assert.equal(target.session.revision, 11);
	assert.equal(target.session.timelineTool, 'blade');
	assert.deepEqual(target.tools, ['blade']);
	assert.match(target.session.view.status.textContent, /Blade timeline tool active/);
	assert.deepEqual(target.events, [[
		'timeline:tool',
		{ revision: 11, tool: 'blade' }
	]]);
	assert.equal(movieStudioCommandState(target).tool, 'blade');
	assert.doesNotThrow(() => JSON.stringify(movieStudioCommandState(target)));
});

test('catalog and aliases expose the bounded tool payload', () => {
	assert.equal(resolveMovieStudioCommandName('timeline.setTool'), 'setTimelineTool');
	assert.equal(
		MOVIE_COMMAND_CATALOG_ENTRIES.setTimelineTool.payload.tool,
		'Required supported timeline tool.'
	);
	assert.equal(MOVIE_COMMAND_CATALOG_ENTRIES.setTimelineTool.mutatesProject, false);
	assert.throws(() => setMovieStudioTimelineTool(controller(), 'paint'), /Unknown movie timeline tool/);
});
