//B"H
//Boruch Hashem
//Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	HubInitializationCoordinator,
	INITIAL_PANEL_KEYS
} from './HubInitializationCoordinator.js';

/**
 * The Awtsmoos lets Awtsmoos.com render the social vessel before distant network streams answer.
 * A hydration promise that never settles therefore must never imprison navigation or the initial render.
 */
test('startup resolves while discovery and identity hydration remain pending', async () => {
	const events = [];
	const never = () => new Promise(() => {});
	const app = {
		status: { show: (...args) => events.push(['status', ...args]) },
		state: {
			addEventListener: () => events.push(['listener']),
			snapshot: () => ({ identity: { aliasId: '' } })
		},
		discovery: { initialize: () => { events.push(['discovery']); return never(); } },
		identity: { initialize: () => { events.push(['identity']); return never(); } },
		live: { initialize: () => events.push(['live']) },
		render: (_snapshot, reason) => events.push(['render', reason])
	};
	for (const key of INITIAL_PANEL_KEYS) {
		app[key] = { initialize: () => events.push(['panel', key]) };
	}
	await new HubInitializationCoordinator(app).initialize();
	assert.ok(events.some(([kind]) => kind === 'discovery'));
	assert.ok(events.some(([kind]) => kind === 'identity'));
	assert.ok(events.some(([kind]) => kind === 'live'));
	assert.ok(events.some(([kind, reason]) => kind === 'render' && reason === 'initial'));
});
