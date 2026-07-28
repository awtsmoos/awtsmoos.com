// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { bootMinimalSharedMeadow } from '../../launcher/MinimalSharedMeadowPage.js';

const elements = new Map();
const documentValue = {
	documentElement: { dataset: {} },
	getElementById(id) {
		if (!elements.has(id)) {
			elements.set(id, {
				dataset: {},
				id,
				textContent: ''
			});
		}
		return elements.get(id);
	}
};
const environment = {
	location: {
		search: '?mode=movie&project=opening-scene'
	}
};
const diagnostics = {
	kind: 'movie-studio',
	project: 'opening-scene'
};
let movieCalls = 0;

const result = await bootMinimalSharedMeadow(
	documentValue,
	environment,
	{
		modeLoaders: {
			async movie(hosts, options) {
				movieCalls += 1;
				assert.equal(hosts.canvas.id, 'AwtsmoosCanvas');
				assert.equal(
					options.search,
					'?mode=movie&project=opening-scene'
				);
				return diagnostics;
			}
		}
	}
);

assert.equal(result, diagnostics);
assert.equal(environment.AwtsmoosMitzvahWorld, diagnostics);
assert.equal(movieCalls, 1);
assert.equal(documentValue.documentElement.dataset.awtsmoosGameplay, 'true');
assert.equal(documentValue.documentElement.dataset.awtsmoosSession, 'movie');

console.log('minimal shared meadow opens the explicit Movie route');
