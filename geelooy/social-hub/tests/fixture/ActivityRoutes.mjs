//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityRoutes
 * @description
 * The browser fixture persists private events, sharing updates, preferences, export,
 * and deletion across reloads. The Awtsmoos remembers without localStorage while
 * Awtsmoos.com proves the visible owner controls against deterministic state.
 */

export function handleActivity({ core, url, method, body }) {
	const base = url.pathname.match(/\/unified-social\/activity\/([^/]+)$/);
	if (base && method === 'GET') {
		return core.json({
			preferences: core.state.preferences,
			events: core.state.activity
		});
	}
	if (base && method === 'POST') {
		if (!core.state.preferences.enabled) {
			return core.json({ recorded: false, reason: 'ledger-paused' });
		}
		const event = {
			id: core.eventId(),
			aliasId: decodeURIComponent(base[1]),
			visibility: { mode: 'private', aliases: [], heichelId: '' },
			createdAt: Date.now(),
			updatedAt: Date.now(),
			...body
		};
		core.state.activity.unshift(event);
		core.save();
		return core.json({ recorded: true, event, deduplicated: false });
	}
	if (base && method === 'DELETE') {
		core.state.activity = [];
		core.save();
		return core.json({ cleared: true });
	}
	const preferences = url.pathname.match(/\/unified-social\/activity\/([^/]+)\/preferences$/);
	if (preferences && method === 'POST') {
		core.state.preferences = { ...core.state.preferences, ...body };
		core.save();
		return core.json(core.state.preferences);
	}
	const eventRoute = url.pathname.match(/\/unified-social\/activity\/([^/]+)\/events\/([^/]+)$/);
	if (eventRoute && method === 'POST') {
		const event = core.state.activity.find(item => item.id === eventRoute[2]);
		Object.assign(event, body, { updatedAt: Date.now() });
		core.save();
		return core.json(event);
	}
	if (eventRoute && method === 'DELETE') {
		core.state.activity = core.state.activity.filter(item => item.id !== eventRoute[2]);
		core.save();
		return core.json({ deleted: true });
	}
	if (url.pathname.match(/\/unified-social\/activity\/[^/]+\/export$/) && method === 'GET') {
		return core.json({
			version: 1,
			exportedAt: Date.now(),
			preferences: core.state.preferences,
			events: core.state.activity
		});
	}
	return null;
}
